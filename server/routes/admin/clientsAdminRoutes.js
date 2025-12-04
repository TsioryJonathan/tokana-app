const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} = require('../../controllers/admin/clientsAdminController');

// Toutes les routes nécessitent auth admin
router.use(protect);
router.use(authorize('admin'));

router.get('/', listClients);
router.get('/:id', getClient);
router.post('/', createClient);
router.patch('/:id', updateClient);
router.delete('/:id', deleteClient);

module.exports = router;
