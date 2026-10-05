import { CosmicCosmos } from './galaxy.js';
import { CosmicAudio } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
  const audio = new CosmicAudio();
  const dossier = document.getElementById('project-dossier');
  const heroCallout = document.getElementById('hero-callout');
  const dockBtns = document.querySelectorAll('.dock-btn[data-target]');

  // Elements in the dossier
  const dossierBadge = document.getElementById('dossier-badge');
  const dossierTitle = document.getElementById('dossier-title');
  const dossierType = document.getElementById('dossier-type');
  const dossierRole = document.getElementById('dossier-role');
  const dossierDesc = document.getElementById('dossier-desc');
  const dossierTechPills = document.getElementById('dossier-tech-pills');
  const dossierLink = document.getElementById('dossier-link');
  const dossierCloseBtn = document.getElementById('dossier-close');

  // Callback when a project is selected (via 3D click or dock button)
  const handleProjectSelect = (projectData) => {
    dockBtns.forEach(btn => btn.classList.remove('active'));

    if (projectData) {
      // Highlight dock button
      const targetBtn = document.querySelector(`.dock-btn[data-target="${projectData.id}"]`);
      if (targetBtn) targetBtn.classList.add('active');

      // Populate Dossier
      if (dossierBadge) dossierBadge.textContent = projectData.badge;
      if (dossierTitle) dossierTitle.textContent = projectData.name;
      if (dossierType) dossierType.textContent = projectData.type;
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
      if (heroCallout) heroCallout.classList.add('faded');
      audio.playWarp();
    } else {
      // Return to Singularidad overview
      const defaultBtn = document.querySelector('.dock-btn[data-target="singularidad"]');
      if (defaultBtn) defaultBtn.classList.add('active');

      if (dossier) dossier.classList.remove('active');
      if (heroCallout) heroCallout.classList.remove('faded');
      audio.playClick();
    }
  };

  // 1. Initialize 3D Planetarium & Gargantua Cosmos
  const cosmos = new CosmicCosmos('webgl-container', handleProjectSelect);

  // 2. Dock Button Interactions
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
      cosmos.focusProject('singularidad');
    });
  }

  // 3. Audio Synthesizer Control
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundLabel = document.getElementById('sound-label');

  if (soundToggleBtn && soundLabel) {
    soundToggleBtn.addEventListener('click', () => {
      const isSoundOn = audio.toggleSound();
      soundLabel.textContent = isSoundOn ? 'FX: ACTIVO' : 'FX: MUTED';
      soundToggleBtn.classList.toggle('primary', isSoundOn);
    });
  }

  // Bind subtle UI sounds to interactive elements
  const soundElements = document.querySelectorAll('button, .hud-btn, .dock-btn, a');
  soundElements.forEach(el => {
    el.addEventListener('mouseenter', () => audio.playHover());
  });

  // 4. Telemetry Clock (Bogotá UTC-5)
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

  // 5. CV Modal Viewer
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
