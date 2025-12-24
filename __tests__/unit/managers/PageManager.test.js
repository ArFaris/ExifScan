import { jest } from '@jest/globals';
import { PageManager } from '../../../src/app/managers/pageManager.js';

describe('PageManager', () => {
  let pageManager;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="header-button">Начать сейчас</button>
      <main id="upload" class="page active"></main>
      <main id="results" class="results page"></main>
      <div id="loader" class="loader"></div>
    `;

    pageManager = new PageManager();
  });

  describe('showFirstPage()', () => {
    test('должен показывать первую страницу и скрывать вторую', () => {
      const scrollToSpy = jest.fn();
      window.scrollTo = scrollToSpy;

      pageManager.showFirstPage();

      const uploadPage = document.getElementById('upload');
      const resultsPage = document.getElementById('results');

      expect(uploadPage.classList.contains('active')).toBe(true);
      expect(resultsPage.classList.contains('active')).toBe(false);
    });
  });

  describe('showSecondPage()', () => {
    test('должен показывать вторую страницу и скрывать первую', () => {
      pageManager.showSecondPage();

      const uploadPage = document.getElementById('upload');
      const resultsPage = document.getElementById('results');

      expect(uploadPage.classList.contains('active')).toBe(false);
      expect(resultsPage.classList.contains('active')).toBe(true);
    });
  });

  describe('showLoader()', () => {
    test('должен показывать лоадер', () => {
      const loader = document.getElementById('loader');
      loader.classList.add = jest.fn();
      
      pageManager.showLoader();
      
      expect(loader.classList.add).toHaveBeenCalledWith('active');
    });
  });

  describe('hideLoader()', () => {
    test('должен скрывать лоадер', () => {
      const loader = document.getElementById('loader');
      loader.classList.remove = jest.fn();

      pageManager.hideLoader();

      expect(loader.classList.remove).toHaveBeenCalledWith('active');
    });
  });

  describe('isSecondPageActive()', () => {
    test('должен возвращать true когда вторая страница активна', () => {
      const resultsPage = document.getElementById('results');
      resultsPage.classList.contains = jest.fn().mockReturnValue(true);
      
      expect(pageManager.isSecondPageActive()).toBe(true);
    });

    test('должен возвращать false когда первая страница активна', () => {
      const resultsPage = document.getElementById('results');
      resultsPage.classList.contains = jest.fn().mockReturnValue(false);
      
      expect(pageManager.isSecondPageActive()).toBe(false);
    });
  });
});