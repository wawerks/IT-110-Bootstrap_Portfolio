/**
 * Projects section: category filters + modal content from <template> nodes.
 */
(function () {
  'use strict';

  var modalEl = document.getElementById('projectDetailModal');
  if (modalEl) {
    modalEl.addEventListener('show.bs.modal', function (event) {
      var btn = event.relatedTarget;
      if (!btn || !btn.getAttribute) return;
      var tid = btn.getAttribute('data-detail-template');
      var title = btn.getAttribute('data-detail-title') || 'Project';
      var tpl = tid ? document.getElementById(tid) : null;
      var body = document.getElementById('projectDetailModalBody');
      var label = document.getElementById('projectDetailModalLabel');
      if (label) label.textContent = title;
      if (body && tpl && tpl.content) {
        body.innerHTML = '';
        body.appendChild(tpl.content.cloneNode(true));
      }
    });
  }

  var filtersRoot = document.querySelector('.projects-showcase-filters');
  var grid = document.querySelector('.projects-showcase-grid');
  if (!filtersRoot || !grid) return;

  var cards = grid.querySelectorAll('.project-card-col');

  filtersRoot.querySelectorAll('.projects-filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      filtersRoot.querySelectorAll('.projects-filter-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter') || '*';

      cards.forEach(function (col) {
        var cat = col.getAttribute('data-category') || '';
        var show = f === '*' || cat === f;
        col.classList.toggle('project-card-col--hidden', !show);
      });

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
  });
})();
