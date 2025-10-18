const express = require('express');
const router = express.Router();
const SeedService = require('../services/seedService');
const { requireSuperAdmin } = require('../middleware/auth');

const seedService = new SeedService();

/**
 * @route   POST /api/seed/all
 * @desc    إنشاء جميع البيانات التجريبية
 * @access  Super Admin only
 */
router.post('/all', requireSuperAdmin, async (req, res) => {
    try {
        const { clearFirst = false } = req.body;
        
        await seedService.seedAll(clearFirst);
        
        const summary = await seedService.getSummary();
        
        res.json({
            success: true,
            message: 'تم إنشاء جميع البيانات التجريبية بنجاح',
            data: summary
        });
    } catch (error) {
        console.error('Error seeding all data:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء البيانات التجريبية',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/seed/categories
 * @desc    إنشاء الفئات التجريبية
 * @access  Super Admin only
 */
router.post('/categories', requireSuperAdmin, async (req, res) => {
    try {
        await seedService.seedCategories();
        
        res.json({
            success: true,
            message: 'تم إنشاء الفئات التجريبية بنجاح'
        });
    } catch (error) {
        console.error('Error seeding categories:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الفئات التجريبية',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/seed/users
 * @desc    إنشاء المستخدمين التجريبيين
 * @access  Super Admin only
 */
router.post('/users', requireSuperAdmin, async (req, res) => {
    try {
        await seedService.seedUsers();
        
        res.json({
            success: true,
            message: 'تم إنشاء المستخدمين التجريبيين بنجاح'
        });
    } catch (error) {
        console.error('Error seeding users:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء المستخدمين التجريبيين',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/seed/courses
 * @desc    إنشاء الدورات التجريبية
 * @access  Super Admin only
 */
router.post('/courses', requireSuperAdmin, async (req, res) => {
    try {
        await seedService.seedCourses();
        
        res.json({
            success: true,
            message: 'تم إنشاء الدورات التجريبية بنجاح'
        });
    } catch (error) {
        console.error('Error seeding courses:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الدورات التجريبية',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/seed/lessons
 * @desc    إنشاء الدروس التجريبية
 * @access  Super Admin only
 */
router.post('/lessons', requireSuperAdmin, async (req, res) => {
    try {
        await seedService.seedLessons();
        
        res.json({
            success: true,
            message: 'تم إنشاء الدروس التجريبية بنجاح'
        });
    } catch (error) {
        console.error('Error seeding lessons:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الدروس التجريبية',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/seed/enrollments
 * @desc    إنشاء التسجيلات التجريبية
 * @access  Super Admin only
 */
router.post('/enrollments', requireSuperAdmin, async (req, res) => {
    try {
        await seedService.seedEnrollments();
        
        res.json({
            success: true,
            message: 'تم إنشاء التسجيلات التجريبية بنجاح'
        });
    } catch (error) {
        console.error('Error seeding enrollments:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء التسجيلات التجريبية',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/seed/progress
 * @desc    إنشاء تقدم الطلاب التجريبي
 * @access  Super Admin only
 */
router.post('/progress', requireSuperAdmin, async (req, res) => {
    try {
        await seedService.seedProgress();
        
        res.json({
            success: true,
            message: 'تم إنشاء تقدم الطلاب التجريبي بنجاح'
        });
    } catch (error) {
        console.error('Error seeding progress:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء تقدم الطلاب التجريبي',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/seed/clear
 * @desc    حذف جميع البيانات التجريبية
 * @access  Super Admin only
 */
router.delete('/clear', requireSuperAdmin, async (req, res) => {
    try {
        await seedService.clearAllData();
        
        res.json({
            success: true,
            message: 'تم حذف جميع البيانات التجريبية بنجاح'
        });
    } catch (error) {
        console.error('Error clearing data:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف البيانات التجريبية',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/seed/summary
 * @desc    الحصول على ملخص البيانات الحالية
 * @access  Super Admin only
 */
router.get('/summary', requireSuperAdmin, async (req, res) => {
    try {
        const summary = await seedService.getSummary();
        
        res.json({
            success: true,
            message: 'تم الحصول على ملخص البيانات بنجاح',
            data: summary
        });
    } catch (error) {
        console.error('Error getting summary:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الحصول على ملخص البيانات',
            error: error.message
        });
    }
});

module.exports = router;