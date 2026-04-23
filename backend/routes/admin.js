const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Protect all admin routes
router.use(authenticateToken);
router.use(authorizeRole(['ADMIN']));

// --- STATISTICS ---
router.get('/stats', async (req, res) => {
  try {
    const totalSantri = await prisma.santri.count();
    const totalGuru = await prisma.guru.count();
    const totalKelas = await prisma.kelas.count();
    
    // Get attendance count for today
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);
    
    const hadirToday = await prisma.absensi.count({
      where: {
        status: 'HADIR',
        date: { gte: startToday, lte: endToday }
      }
    });

    // Get weekly attendance data (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const count = await prisma.absensi.count({
        where: {
          status: 'HADIR',
          date: { gte: d, lt: nextD }
        }
      });

      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      weeklyData.push({ day: dayName, count });
    }

    res.json({ totalSantri, totalGuru, totalKelas, hadirToday, weeklyData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- GURU ---
router.get('/guru', async (req, res) => {
  try {
    const gurus = await prisma.guru.findMany({
      include: { user: { select: { username: true } } }
    });
    res.json(gurus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/guru', async (req, res) => {
  const { name, nip, phone, username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const guru = await prisma.guru.create({
      data: {
        name,
        nip,
        phone,
        user: {
          create: {
            username,
            password: hashedPassword,
            role: 'GURU'
          }
        }
      }
    });
    res.json(guru);
  } catch (error) {
    res.status(400).json({ message: 'Error creating guru. NIP or Username might already exist.' });
  }
});

router.put('/guru/:id', async (req, res) => {
  const { name, nip, phone } = req.body;
  try {
    const guru = await prisma.guru.update({
      where: { id: req.params.id },
      data: { name, nip, phone }
    });
    res.json(guru);
  } catch (error) {
    res.status(400).json({ message: 'Error updating guru' });
  }
});

router.delete('/guru/:id', async (req, res) => {
  try {
    const guruId = req.params.id;
    
    // 1. Check if guru exists and include relations
    const guru = await prisma.guru.findUnique({
      where: { id: guruId },
      include: { user: true, classes: true }
    });

    if (!guru) return res.status(404).json({ message: 'Guru not found' });

    // 2. Handle related classes (disconnect or delete)
    // For safety, we'll prevent deletion if teaching a class, or the user can choose
    if (guru.classes.length > 0) {
      return res.status(400).json({ message: 'Guru tidak bisa dihapus karena masih mengajar di kelas. Hapus atau pindahkan kelas terlebih dahulu.' });
    }

    // 3. Delete related User if exists
    if (guru.user) {
      await prisma.user.delete({ where: { id: guru.user.id } });
    }

    // 4. Delete the Guru
    await prisma.guru.delete({ where: { id: guruId } });
    
    res.json({ message: 'Guru deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Gagal menghapus guru. Pastikan tidak ada data terkait (absensi/kelas).' });
  }
});

// --- SANTRI ---
router.get('/santri', async (req, res) => {
  try {
    const santri = await prisma.santri.findMany({
      include: { 
        kelas: true, 
        parent: { select: { username: true } },
        absensi: true
      }
    });
    res.json(santri);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/santri/:id', async (req, res) => {
  try {
    await prisma.absensi.deleteMany({ where: { santriId: req.params.id } });
    await prisma.santri.delete({ where: { id: req.params.id } });
    res.json({ message: 'Santri deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting santri' });
  }
});

router.post('/santri', async (req, res) => {
  const { name, nis, kelasId, parentUsername, parentPassword } = req.body;
  try {
    // Create or connect parent user
    let parentId = null;
    if (parentUsername) {
      const hashedPassword = await bcrypt.hash(parentPassword, 10);
      const parentUser = await prisma.user.create({
        data: {
          username: parentUsername,
          password: hashedPassword,
          role: 'WALI'
        }
      });
      parentId = parentUser.id;
    }

    const santri = await prisma.santri.create({
      data: {
        name,
        nis,
        kelasId,
        parentId
      }
    });
    res.json(santri);
  } catch (error) {
    res.status(400).json({ message: 'Error creating santri.' });
  }
});

// --- KELAS ---
router.get('/kelas', async (req, res) => {
  try {
    const kelas = await prisma.kelas.findMany({
      include: { guru: true, _count: { select: { santri: true } } }
    });
    res.json(kelas);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/kelas', async (req, res) => {
  const { name, guruId } = req.body;
  try {
    const kelas = await prisma.kelas.create({
      data: { name, guruId }
    });
    res.json(kelas);
  } catch (error) {
    res.status(400).json({ message: 'Error creating kelas.' });
  }
});

router.put('/kelas/:id', async (req, res) => {
  const { name, guruId } = req.body;
  try {
    const kelas = await prisma.kelas.update({
      where: { id: req.params.id },
      data: { name, guruId }
    });
    res.json(kelas);
  } catch (error) {
    res.status(400).json({ message: 'Error updating kelas.' });
  }
});

router.delete('/kelas/:id', async (req, res) => {
  try {
    const kelas = await prisma.kelas.findUnique({
      where: { id: req.params.id },
      include: { santri: true }
    });
    if (kelas.santri.length > 0) {
      return res.status(400).json({ message: 'Kelas tidak bisa dihapus karena masih memiliki santri.' });
    }
    await prisma.kelas.delete({ where: { id: req.params.id } });
    res.json({ message: 'Kelas deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting kelas.' });
  }
});

module.exports = router;
