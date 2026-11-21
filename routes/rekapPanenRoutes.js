const express = require('express');
const router = express.Router();
const {
  createRekapPanen,
  getAllRekapPanen,
  getRekapPanenById,
  updateRekapPanen,
  deleteRekapPanen
} = require('../controllers/rekapPanenController');

router.post('/', createRekapPanen);
router.get('/', getAllRekapPanen);
router.get('/:id', getRekapPanenById);
router.put('/:id', updateRekapPanen);
router.delete('/:id', deleteRekapPanen);

module.exports = router;