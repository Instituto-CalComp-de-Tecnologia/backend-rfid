import { Router } from "express";
import * as ApiController from '../controllers/apiController';

const router = Router();

router.get('/', ApiController.apiGet);

router.post('/', ApiController.apiPost);

router.put('/', ApiController.apiPut);

router.delete('/', ApiController.apiDelete);

export default router;