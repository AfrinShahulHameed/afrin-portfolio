(function(){
  // Theme toggle, persisted (defaults to dark, matching the site's design)
  var root = document.documentElement;
  var toggle = document.querySelector('.theme-toggle');
  function applyTheme(t){
    if(t === 'light'){ root.setAttribute('data-theme', 'light'); }
    else { root.removeAttribute('data-theme'); }
    if(toggle){ toggle.textContent = (t === 'light') ? '☾' : '☀'; }
  }
  var saved = null;
  try{ saved = localStorage.getItem('theme'); }catch(e){}
  applyTheme(saved);
  if(toggle){
    toggle.addEventListener('click', function(){
      var isLight = root.getAttribute('data-theme') === 'light';
      var next = isLight ? 'dark' : 'light';
      applyTheme(next);
      try{ localStorage.setItem('theme', next); }catch(e){}
    });
  }

  // Mobile nav
  var hamburger = document.querySelector('.hamburger');
  var navLinks = document.querySelector('.nav-links');
  if(hamburger && navLinks){
    hamburger.addEventListener('click', function(){
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ navLinks.classList.remove('open'); });
    });
  }

  // Scroll reveal + skill bar fill
  var revealEls = document.querySelectorAll('.reveal');
  function fillBars(container){
    container.querySelectorAll('.bar i').forEach(function(b){
      var pct = b.getAttribute('data-fill');
      if(pct){ b.style.width = pct + '%'; }
    });
  }
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          fillBars(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); fillBars(el); });
  }

  // Active nav link on scroll
  var sections = document.querySelectorAll('main section[id]');
  var navA = document.querySelectorAll('.nav-links a');
  if(sections.length && navA.length && 'IntersectionObserver' in window){
    var navIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          navA.forEach(function(a){
            var href = a.getAttribute('href') || '';
            a.classList.toggle('active', href.indexOf('#' + entry.target.id) !== -1);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function(s){ navIo.observe(s); });
  }

  // Broken image fallback for project screenshots
  document.querySelectorAll('.p-shot img').forEach(function(img){
    img.addEventListener('error', function(){
      img.closest('.p-shot').classList.add('noimg');
    });
  });

  // Formspree AJAX submit (stays on page, shows a status message)
  var form = document.getElementById('contact-form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var statusEl = document.getElementById('form-status');
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn ? submitBtn.textContent : '';
      if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
      if(statusEl){ statusEl.textContent = ''; statusEl.className = 'form-status'; }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function(response){
        if(response.ok){
          if(statusEl){ statusEl.textContent = "Thanks, that's sent, I'll get back to you soon."; statusEl.className = 'form-status ok'; }
          form.reset();
        } else {
          response.json().then(function(data){
            var msg = (data && data.errors) ? data.errors.map(function(er){ return er.message; }).join(', ') : 'Something went wrong, please try emailing me directly.';
            if(statusEl){ statusEl.textContent = msg; statusEl.className = 'form-status err'; }
          }).catch(function(){
            if(statusEl){ statusEl.textContent = 'Something went wrong, please try emailing me directly.'; statusEl.className = 'form-status err'; }
          });
        }
      }).catch(function(){
        if(statusEl){ statusEl.textContent = 'Network error, please try emailing me directly.'; statusEl.className = 'form-status err'; }
      }).finally(function(){
        if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = originalText; }
      });
    });
  }
})();
