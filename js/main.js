import { CosmicCosmos } from './galaxy.js';
import { CosmicAudio } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
  const audio = new CosmicAudio();
  const dossier = document.getElementById('project-dossier');
  const orbitDock = document.getElementById('orbit-dock');
  const cosmosBadge = document.getElementById('cosmos-badge');
  const dockBtns = document.querySelectorAll('.dock-btn[data-target]');
  const scrollToCosmosBtn = document.getElementById('btn-scroll-to-cosmos');

  // Dossier elements
  const dossierBadge = document.getElementById('dossier-badge');
  const dossierTitle = document.getElementById('dossier-title');
  const dossierTechTag = document.getElementById('dossier-tech-tag');
  const dossierRole = document.getElementById('dossier-role');
  const dossierDesc = document.getElementById('dossier-desc');
  const dossierTechPills = document.getElementById('dossier-tech-pills');
  const dossierLink = document.getElementById('dossier-link');
  const dossierCloseBtn = document.getElementById('dossier-close');

  // Handle Project Selection from 3D canvas or Dock
  const handleProjectSelect = (projectData) => {
    dockBtns.forEach(btn => btn.classList.remove('active'));

    if (projectData) {
      // Find matching dock button
      const targetBtn = document.querySelector(`.dock-btn[data-target="${projectData.id}"]`);
      if (targetBtn) targetBtn.classList.add('active');

      if (dossierBadge) dossierBadge.textContent = projectData.badge;
      if (dossierTitle) dossierTitle.textContent = projectData.name;
      if (dossierTechTag) dossierTechTag.textContent = projectData.techName;
      if (dossierRole) dossierRole.textContent = projectData.role;
      if (dossierDesc) dossierDesc.textContent = projectData.desc;

      if (dossierTechPills) {
        dossierTechPills.innerHTML = '';
        const tags = projectData.stack.split('•').map(t => t.trim());
        tags.forEach(tag => {
          const pill = document.createElement('span');
          pill.className = 'tech-pill';
          pill.textContent = tag;
          dossierTechPills.appendChild(pill);
        });
      }

      if (dossierLink) {
        dossierLink.href = projectData.link;
      }

      if (dossier) dossier.classList.add('active');
      audio.playWarp();
    } else {
      const defaultBtn = document.querySelector('.dock-btn[data-target="singularidad"]');
      if (defaultBtn) defaultBtn.classList.add('active');

      if (dossier) dossier.classList.remove('active');
      audio.playClick();
    }
  };

  // 1. Initialize 3D Engine
  const cosmos = new CosmicCosmos('webgl-container', handleProjectSelect);

  // 2. Scroll Choreography for Two-Phase Experience
  const onScroll = () => {
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollMax > 0 ? window.scrollY / scrollMax : 0;

    cosmos.setScrollProgress(progress);

    if (progress > 0.25) {
      if (orbitDock) orbitDock.classList.add('visible');
      if (cosmosBadge) cosmosBadge.classList.add('visible');
    } else {
      if (orbitDock) orbitDock.classList.remove('visible');
      if (cosmosBadge) cosmosBadge.classList.remove('visible');
      if (dossier?.classList.contains('active') && progress === 0) {
        cosmos.focusProject('singularidad');
      }
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Initial check

  if (scrollToCosmosBtn) {
    scrollToCosmosBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: window.innerHeight * 0.95,
        behavior: 'smooth'
      });
      audio.playWarp();
    });
  }

  // 3. Dock Button Interactions
  dockBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      cosmos.focusProject(targetId);
      audio.playClick();
    });
  });

  if (dossierCloseBtn) {
    dossierCloseBtn.addEventListener('click', () => {
      cosmos.focusProject('singularidad');
    });
  }

  const brandHomeBtn = document.getElementById('btn-brand-home');
  if (brandHomeBtn) {
    brandHomeBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      cosmos.focusProject('singularidad');
    });
  }

  // 4. Audio Control
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundLabel = document.getElementById('sound-label');

  if (soundToggleBtn && soundLabel) {
    soundToggleBtn.addEventListener('click', () => {
      const isSoundOn = audio.toggleSound();
      soundLabel.textContent = isSoundOn ? 'FX: ACTIVO' : 'FX: MUTED';
      soundToggleBtn.classList.toggle('primary', isSoundOn);
    });
  }

  const soundElements = document.querySelectorAll('button, .hud-btn, .dock-btn, a');
  soundElements.forEach(el => {
    el.addEventListener('mouseenter', () => audio.playHover());
  });

  // 5. Telemetry Clock (Bogotá UTC-5)
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

  // 6. CV Modal Viewer
  const cvModalBackdrop = document.getElementById('cv-modal-backdrop');
  const cvFrame = document.getElementById('cv-iframe');
  const openCvBtns = document.querySelectorAll('.btn-open-cv');
  const closeCvBtn = document.getElementById('btn-close-cv');
  const printCvBtn = document.getElementById('btn-print-cv');

  const openCV = () => {
    if (cvModalBackdrop) {
      cvModalBackdrop.classList.add('active');
      audio.playWarp();
    }
  };

  const closeCV = () => {
    if (cvModalBackdrop) {
      cvModalBackdrop.classList.remove('active');
      audio.playClick();
    }
  };

  openCvBtns.forEach(btn => {
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
      if (e.target === cvModalBackdrop) closeCV();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (cvModalBackdrop?.classList.contains('active')) {
        closeCV();
      } else if (dossier?.classList.contains('active')) {
        cosmos.focusProject('singularidad');
      }
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
});
