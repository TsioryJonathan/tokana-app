import { Router } from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import {
  listZones, listAxesByZone, listLocalitiesByAxis,
  createZone, updateZone, deleteZone,
  createAxis, updateAxis, deleteAxis,
  createLocality, updateLocality, deleteLocality,
  getZoneGeometry, setZoneGeometry, setZoneGeometryByKey,
} from '../../controllers/admin/zonesAdminController.js';
import {
  validateCreateZone, validateUpdateZone,
  validateCreateAxis, validateUpdateAxis,
  validateCreateLocality, validateUpdateLocality,
} from '../../validators/admin/zonesAdminValidators.js';

const router = Router();

// All admin zone routes are protected and admin-only
router.use(protect, authorize('admin'));

// Lists (admin)
router.get('/', listZones);                                 // GET /api/admin/zones
router.get('/:zoneId/axes', listAxesByZone);                // GET /api/admin/zones/:zoneId/axes
router.get('/axes/:axisId/localities', listLocalitiesByAxis); // GET /api/admin/zones/axes/:axisId/localities

// Zones
router.post('/', validateCreateZone, createZone);                 // POST /api/admin/zones
router.put('/:id', validateUpdateZone, updateZone);               // PUT /api/admin/zones/:id
router.delete('/:id', deleteZone);            // DELETE /api/admin/zones/:id

// Zones geometry (GeoJSON)
router.get('/:id/geometry', getZoneGeometry);                     // GET /api/admin/zones/:id/geometry
router.put('/:id/geometry', setZoneGeometry);                     // PUT /api/admin/zones/:id/geometry
router.put('/key/:key/geometry', setZoneGeometryByKey);           // PUT /api/admin/zones/key/:key/geometry

// Axes
router.post('/:zoneId/axes', validateCreateAxis, createAxis);     // POST /api/admin/zones/:zoneId/axes
router.put('/axes/:id', validateUpdateAxis, updateAxis);          // PUT /api/admin/zones/axes/:id
router.delete('/axes/:id', deleteAxis);       // DELETE /api/admin/zones/axes/:id

// Localities
router.post('/axes/:axisId/localities', validateCreateLocality, createLocality);    // POST /api/admin/zones/axes/:axisId/localities
router.put('/localities/:id', validateUpdateLocality, updateLocality);               // PUT /api/admin/zones/localities/:id
router.delete('/localities/:id', deleteLocality);            // DELETE /api/admin/zones/localities/:id

export default router;
