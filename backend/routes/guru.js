const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRole(['GURU']));

// Get classes assigned to guru
router.get('/my-classes', async (req, res) => {
  try {
    const classes = await prisma.kelas.findMany({
      where: { guruId: req.user.guruId },
      include: { _count: { select: { santri: true } } }
    });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get santri in a class
router.get('/class/:kelasId/santri', async (req, res) => {
  try {
    const santri = await prisma.santri.findMany({
      where: { kelasId: req.params.kelasId }
    });
    res.json(santri);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit attendance
router.post('/absensi', async (req, res) => {
  const { records, date } = req.body; // Array of { santriId, status, notes }, date: YYYY-MM-DD
  const guruId = req.user.guruId;

  if (!date) return res.status(400).json({ message: 'Tanggal harus dipilih.' });

  const targetDate = new Date(date);
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999);

  try {
    // 1. Check if any record already exists for this class/guru on this date
    // We check for the first santri in the list to simplify
    if (records.length > 0) {
      const existing = await prisma.absensi.findFirst({
        where: {
          santriId: records[0].santriId,
          date: { gte: start, lte: end }
        }
      });
      if (existing) {
        return res.status(400).json({ message: 'Absensi untuk tanggal ini sudah diisi.' });
      }
    }

    const absensi = await Promise.all(
      records.map(rec => 
        prisma.absensi.create({
          data: {
            santriId: rec.santriId,
            status: rec.status,
            notes: rec.notes,
            guruId: guruId,
            date: targetDate
          }
        })
      )
    );
    res.json({ message: 'Absensi berhasil disimpan', count: absensi.length });
  } catch (error) {
    res.status(400).json({ message: 'Error saving absensi' });
  }
});

// Get attendance history for a class
router.get('/history/:kelasId', async (req, res) => {
  const { date } = req.query; // YYYY-MM-DD
  try {
    const where = {
      santri: { kelasId: req.params.kelasId }
    };
    
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }

    const history = await prisma.absensi.findMany({
      where,
      include: { santri: { select: { name: true, nis: true } } },
      orderBy: { date: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all attendance history for the logged-in guru
router.get('/my-history', async (req, res) => {
  try {
    const history = await prisma.absensi.findMany({
      where: { guruId: req.user.guruId },
      include: { 
        santri: { 
          select: { 
            name: true, 
            nis: true,
            kelas: { select: { name: true, id: true } }
          } 
        } 
      },
      orderBy: { date: 'desc' }
    });
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
