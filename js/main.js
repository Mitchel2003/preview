import { CosmicGalaxy } from './galaxy.js';
import { CosmicAudio } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Galaxy Engine
  const galaxy = new CosmicGalaxy('webgl-container');

  // 2. Initialize Audio Synthesizer
  const audio = new CosmicAudio();
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundLabel = document.getElementById('sound-label');

  if (soundToggleBtn && soundLabel) {
    soundToggleBtn.addEventListener('click', () => {
      const isSoundOn = audio.toggleSound();
      soundLabel.textContent = isSoundOn ? 'FX: ACTIVO' : 'FX: MUTED';
      soundToggleBtn.classList.toggle('primary', isSoundOn);
    });
  }

  // Bind interactive audio blips on interactive elements
  const interactiveElements = document.querySelectorAll(
    'button, .hud-btn, .dock-item, .system-card, .stat-card, a'
  );
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => audio.playHover());
    el.addEventListener('click', () => audio.playClick());
  });

  // Link System Cards hover directly to 3D Orbital Nodes
  const systemCards = document.querySelectorAll('.system-card[id]');
  systemCards.forEach((card) => {
    const nodeId = card.id.replace('card-', '');
    card.addEventListener('mouseenter', () => {
      if (galaxy) galaxy.highlightNode(nodeId);
    });
    card.addEventListener('mouseleave', () => {
      if (galaxy) galaxy.highlightNode(null);
    });
  });

  // 3. Telemetry Clock (Bogotá UTC-5)
  const timeDisplay = document.getElementById('telemetry-time');
  if (timeDisplay) {
    const updateTime = () => {
      const now = new Date();
      const options = {
        timeZone: 'America/Bogota',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      timeDisplay.textContent = `BOG: ${new Intl.DateTimeFormat('en-US', options).format(now)} COT`;
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  // 4. Navigation Dock & Camera Focus
  const dockItems = document.querySelectorAll('.dock-item');
  dockItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSectionId = item.getAttribute('href')?.replace('#', '');
      const targetCameraFocus = item.getAttribute('data-focus') || 'overview';

      // Trigger 3D camera warp transition
      if (galaxy) {
        galaxy.setCameraFocus(targetCameraFocus);
        audio.playWarp();
      }

      // Smooth scroll to section
      if (targetSectionId) {
        const targetEl = document.getElementById(targetSectionId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      dockItems.forEach((d) => d.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Scrollspy to auto-highlight dock item
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        dockItems.forEach((item) => {
          if (item.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
            const focus = item.getAttribute('data-focus');
            if (focus && galaxy) {
              galaxy.setCameraFocus(focus);
            }
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((sec) => observer.observe(sec));

  // 5. CV Modal Viewer Logic
  const cvModalBackdrop = document.getElementById('cv-modal-backdrop');
  const cvFrame = document.getElementById('cv-iframe');
  const openCvBtns = document.querySelectorAll('.btn-open-cv');
  const closeCvBtn = document.getElementById('btn-close-cv');
  const printCvBtn = document.getElementById('btn-print-cv');

  const openCV = () => {
    if (cvModalBackdrop) {
      cvModalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
      audio.playWarp();
    }
  };

  const closeCV = () => {
    if (cvModalBackdrop) {
      cvModalBackdrop.classList.remove('active');
      document.body.style.overflow = 'auto';
      audio.playClick();
    }
  };

  openCvBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCV();
    });
  });

  if (closeCvBtn) {
    closeCvBtn.addEventListener('click', closeCV);
  }

  if (cvModalBackdrop) {
    cvModalBackdrop.addEventListener('click', (e) => {
      if (e.target === cvModalBackdrop) {
        closeCV();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cvModalBackdrop?.classList.contains('active')) {
      closeCV();
    }
  });

  if (printCvBtn && cvFrame) {
    printCvBtn.addEventListener('click', () => {
      try {
        cvFrame.contentWindow.focus();
        cvFrame.contentWindow.print();
      } catch (err) {
        window.open('cv_template.html', '_blank');
      }
    });
  }

  // 6. Warp Jump Button in Hero
  const warpJumpBtn = document.getElementById('btn-warp-jump');
  if (warpJumpBtn) {
    warpJumpBtn.addEventListener('click', () => {
      galaxy.triggerWarp(1200);
      audio.playWarp();
    });
  }
});
