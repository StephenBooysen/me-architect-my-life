/**
 * @fileoverview Application views for Express.js application.
 * 
 * @author Architect my life team
 * @version 1.0.14
 * @since 1.0.0
 */

'use strict';

/**
 * Configures and registers application views with the Express application.
 * 
 * @param {Object} app - The express app
 * @return {void}
 */
module.exports = (app) => {

    // Page routes
    app.get('/', async (req, res) => {
        try {
            res.render('pages/dashboard', { title: 'Dashboard - Architect My Life', currentPage: 'dashboard' });
        } catch (error) {
            console.error('Dashboard route error:', error);
            res.status(500).send('Error loading dashboard');
        }
    });

    app.get('/dashboard', async (req, res) => {
        try {
            res.render('pages/dashboard', { title: 'Dashboard - Architect My Life', currentPage: 'dashboard' });
        } catch (error) {
            console.error('Dashboard route error:', error);
            res.status(500).send('Error loading dashboard');
        }
    });

    app.get('/goals', async (req, res) => {
        try {
            res.render('pages/goals', { title: 'Goals - Architect My Life', currentPage: 'goals' });
        } catch (error) {
            console.error('Goals route error:', error);
            res.status(500).send('Error loading goals');
        }
    });

    app.get('/habits', async (req, res) => {
        try {
            res.render('pages/habits', { title: 'Habits - Architect My Life', currentPage: 'habits' });
        } catch (error) {
            console.error('Habits route error:', error);
            res.status(500).send('Error loading habits');
        }
    });

    app.get('/how-you-feel', async (req, res) => {
        try {
            res.render('pages/feelings', { title: 'How You Feel - Architect My Life', currentPage: 'feelings' });
        } catch (error) {
            console.error('Feelings route error:', error);
            res.status(500).send('Error loading feelings');
        }
    });

    app.get('/focus-areas', async (req, res) => {
        try {
            res.render('pages/focus-areas', { title: 'Focus Areas - Architect My Life', currentPage: 'focus-areas' });
        } catch (error) {
            console.error('Focus Areas route error:', error);
            res.status(500).send('Error loading focus areas');
        }
    });

    app.get('/reflection', async (req, res) => {
        try {
            res.render('pages/reflection', { title: 'Reflection - Architect My Life', currentPage: 'reflection' });
        } catch (error) {
            console.error('Reflection route error:', error);
            res.status(500).send('Error loading reflection');
        }
    });

    app.get('/wisdom', async (req, res) => {
        try {
            res.render('pages/wisdom', { title: 'Wisdom - Architect My Life', currentPage: 'wisdom' });
        } catch (error) {
            console.error('Wisdom route error:', error);
            res.status(500).send('Error loading wisdom');
        }
    });

    app.get('/ai-guide', async (req, res) => {
        try {
            res.render('pages/ai-guide', { title: 'AI Guide - Architect My Life', currentPage: 'ai-guide' });
        } catch (error) {
            console.error('AI Guide route error:', error);
            res.status(500).send('Error loading AI guide');
        }
    });

    app.get('/settings', async (req, res) => {
        try {
            res.render('pages/settings', { title: 'Settings - Architect My Life', currentPage: 'settings' });
        } catch (error) {
            console.error('Settings route error:', error);
            res.status(500).send('Error loading settings');
        }
    });

    // Catch all handler: redirect to dashboard for unknown routes
    app.get("*", (req, res) => {
        res.redirect('/dashboard');
    });

};
