const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRole(['WALI']));

// Get children of the logged in parent
router.get('/my-children', async (req, res) => {
  try {
    const children = await prisma.santri.findMany({
      where: { parentId: req.user.id },
      include: { kelas: true }
    });
    res.json(children);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance report for a child
router.get('/report/:santriId', async (req, res) => {
  try {
    // Verify ownership
    const santri = await prisma.santri.findFirst({
      where: { id: req.params.santriId, parentId: req.user.id }
    });

    if (!santri) return res.status(403).json({ message: 'Unauthorized' });

    const absensi = await prisma.absensi.findMany({
      where: { santriId: req.params.santriId },
      orderBy: { date: 'desc' }
    });

    // Calculate stats
    const stats = {
      HADIR: absensi.filter(a => a.status === 'HADIR').length,
      IZIN: absensi.filter(a => a.status === 'IZIN').length,
      SAKIT: absensi.filter(a => a.status === 'SAKIT').length,
      ALPHA: absensi.filter(a => a.status === 'ALPHA').length,
      total: absensi.length
    };

    res.json({ absensi, stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
