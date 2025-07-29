import express from 'express';
import { authMiddleware } from '../middlewares/auth.mdware.js';
import {
    getCategories,
    createCategory,
    deleteCategory,
    updateCategory,
    getGroups,
    createGroup,
    updateGroup,
    deleteGroup
} from '../controllers/category.ctrls.js';

const router = express.Router();

// Category routes
router.get('/', authMiddleware, getCategories);
router.post('/', authMiddleware, createCategory);
router.delete('/:id', authMiddleware, deleteCategory);
router.patch('/:id', authMiddleware, updateCategory);

// Group routes inside category
router.get('/:id/group', authMiddleware, getGroups);
router.post('/:id/group', authMiddleware, createGroup);
router.patch('/:id/group/:groupId', authMiddleware, updateGroup);
router.delete('/:id/group/:groupId', authMiddleware, deleteGroup);

export default router;
