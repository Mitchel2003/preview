import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CosmicCosmos {
  constructor(containerId = 'webgl-container', onProjectSelect = null) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`Container #${containerId} not found.`);
      return;
    }

    this.onProjectSelect = onProjectSelect;
    this.isMobile = window.innerWidth < 768;
    this.activeProject = null;
    this.cameraMode = 'orbit-overview'; // 'orbit-overview' | 'focus-project'

    // Real projects mapping to celestial bodies
    this.projectsData = [
      {
        id: 'systime',
        name: 'Systime Enterprise',
        type: 'Gigante Anillado (Saturno)',
        badge: 'Producción Activa',
        role: 'DevOps Lead & Systems Engineer',
        stack: '.NET 10 • Azure SQL • Quiter ERP • CI/CD',
        desc: 'Ecosistema integral para talleres y concesionarios automotrices. Sincronización en tiempo real con ERP Quiter DMS, multitenancy estricto y runners self-hosted en GitHub Actions.',
        link: 'https://github.com/Mitchel2003',
        orbitRadius: 4.8,
        speed: 0.0055,
        angle: 0.6,
        size: 0.38,
        hasRings: true,
        primaryColor: '#10b981',
        glowColor: '#34d399'
      },
      {
        id: 'sysmed',
        name: 'Sysmed / Ingest',
        type: 'Planeta Bio-Médico',
        badge: 'Sector Regulatorio INVIMA',
        role: 'Full-Stack & Co-Diseñador Arquitectura',
        stack: 'TypeScript • PostgreSQL • Prisma • BullMQ • Redis',
        desc: 'Plataforma para gestión y auditorías regulatorias biomédicas. Arquitectura hexagonal, colas de eventos asíncronas con Redis y permisos granulares CASL.',
        link: 'https://github.com/Mitchel2003/mern_crud',
        orbitRadius: 7.2,
        speed: 0.0038,
        angle: 2.3,
        size: 0.34,
        hasRings: false,
        primaryColor: '#8b5cf6',
        glowColor: '#a78bfa'
      },
      {
        id: 'blazor',
        name: 'Blazor & MAUI DDD',
        type: 'Planeta Crystalline .NET',
        badge: 'Arquitectura de Referencia',
        role: 'Software Architect',
        stack: '.NET 8 • C# • Clean Arch • DDD • MVVM',
        desc: 'Arquitectura empresarial desacoplada bajo Domain-Driven Design y separación de capas agnósticas a UI para clientes web y móviles.',
        link: 'https://github.com/Mitchel2003/Blazor-web-assembly',
        orbitRadius: 9.6,
        speed: 0.0028,
        angle: 4.1,
        size: 0.32,
        hasRings: true,
        primaryColor: '#00f5ff',
        glowColor: '#38bdf8'
      },
      {
        id: 'rpa',
        name: 'RPA & Win32 Systems',
        type: 'Planeta Industrial Automation',
        badge: 'Low-Level Automation',
        role: 'Automation Engineer',
        stack: 'C# Win32 • Playwright • Redis • Screen OCR',
        desc: 'Bots de alto rendimiento para automatización desatendida, bypass de captchas complejos, hooks nativos de Windows e inspección de pantalla en tiempo real.',
        link: 'https://github.com/Mitchel2003',
        orbitRadius: 12.0,
        speed: 0.0021,
        angle: 5.5,
        size: 0.30,
        hasRings: false,
        primaryColor: '#f59e0b',
        glowColor: '#fbbf24'
      }
    ];

    this.mousePointer = new THREE.Vector2(-100, -100);
    this.targetCameraPos = new THREE.Vector3(0, 6.5, 14.5);
    this.targetControlsTarget = new THREE.Vector3(0, 0, 0);

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x02040a, 0.025);

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      250
    );
    this.camera.position.set(0, 7.5, 16.5);

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x010206, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls: Smooth 360 drag, inertia & zoom
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 45;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15; // Don't flip below horizon
    this.controls.target.set(0, 0, 0);

    this.raycaster = new THREE.Raycaster();
    this.particleTexture = this.generateParticleTexture();

    // 1. Gargantua Black Hole (Horizon, Lensing Arch & Accretion Disk)
    this.buildGargantua();

    // 2. Starfield with Depth
    this.buildStarfield();

    // 3. Orbiting Celestial Projects
    this.buildProjects();

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x182038, 1.2);
    this.scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x00f5ff, 4.5, 35, 1.2);
    coreLight.position.set(0, 0, 0);
    this.scene.add(coreLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 2.5, 25, 1.4);
    amberLight.position.set(0, 0.8, 0);
    this.scene.add(amberLight);

    this.bindEvents();
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  generateParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(240, 250, 255, 0.95)');
    gradient.addColorStop(0.5, 'rgba(0, 245, 255, 0.45)');
    gradient.addColorStop(0.8, 'rgba(139, 92, 246, 0.15)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  buildGargantua() {
    this.blackHoleGroup = new THREE.Group();

    // 1. Event Horizon (Pitch-black absolute light trap)
    const horizonGeo = new THREE.SphereGeometry(1.4, 64, 64);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x000000
    });
    this.eventHorizon = new THREE.Mesh(horizonGeo, horizonMat);
    this.blackHoleGroup.add(this.eventHorizon);

    // 2. Gravitational Lensing Arch (The iconic Interstellar curved light beam)
    const archGeo = new THREE.TorusGeometry(1.85, 0.08, 16, 120);
    const archMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    this.lensingArch = new THREE.Mesh(archGeo, archMat);
    this.lensingArch.rotation.x = Math.PI / 2;
    this.blackHoleGroup.add(this.lensingArch);

    // Vertical Bent Halo (Light pulled over the singularity)
    const verticalHaloGeo = new THREE.RingGeometry(1.42, 2.3, 64);
    const verticalHaloMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    this.verticalHalo = new THREE.Mesh(verticalHaloGeo, verticalHaloMat);
    this.blackHoleGroup.add(this.verticalHalo);

    // 3. Volumetric Accretion Disk (60,000 Keplerian Particles)
    const particleCount = this.isMobile ? 30000 : 65000;
    this.accretionGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    this.particleRadii = new Float32Array(particleCount);
    this.particleAngles = new Float32Array(particleCount);
    this.particleSpeeds = new Float32Array(particleCount);

    const minR = 1.6;
    const maxR = 4.2;

    const cWhite = new THREE.Color(0xffffff);
    const cCyan = new THREE.Color(0x00f5ff);
    const cAmber = new THREE.Color(0xf59e0b);
    const cViolet = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Exponential density near horizon
      const r = minR + Math.pow(Math.random(), 2.2) * (maxR - minR);
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 0.14 * (1 - (r - minR) / (maxR - minR));

      positions[i3] = Math.cos(angle) * r;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * r;

      this.particleRadii[i] = r;
      this.particleAngles[i] = angle;
      // Relativistic Kepler speed (inner spins dramatically faster)
      this.particleSpeeds[i] = (0.022 / Math.sqrt(r)) * (0.9 + Math.random() * 0.2);

      const norm = (r - minR) / (maxR - minR);
      const col = new THREE.Color();
      if (norm < 0.2) {
        col.lerpColors(cWhite, cCyan, norm / 0.2);
      } else if (norm < 0.6) {
        col.lerpColors(cCyan, cAmber, (norm - 0.2) / 0.4);
      } else {
        col.lerpColors(cAmber, cViolet, (norm - 0.6) / 0.4);
      }

      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    this.accretionGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.accretionGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.accretionMat = new THREE.PointsMaterial({
      size: this.isMobile ? 0.028 : 0.024,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.95
    });

    this.accretionPoints = new THREE.Points(this.accretionGeo, this.accretionMat);
    this.blackHoleGroup.add(this.accretionPoints);

    // Aesthetic tilt of the black hole equatorial plane
    this.blackHoleGroup.rotation.x = 0.28;
    this.blackHoleGroup.rotation.z = -0.18;
    this.scene.add(this.blackHoleGroup);
  }

  buildStarfield() {
    const starCount = this.isMobile ? 6000 : 15000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const r = 35 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);

      const lum = 0.4 + Math.random() * 0.6;
      col[i3] = lum * 0.8;
      col[i3 + 1] = lum * 0.9;
      col[i3 + 2] = lum;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.035,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.75
    });

    this.starfield = new THREE.Points(geo, mat);
    this.scene.add(this.starfield);
  }

  buildProjects() {
    this.planetMeshes = [];
    this.orbitsGroup = new THREE.Group();

    this.projectsData.forEach((data) => {
      // 1. Orbital Laser Track Line
      const orbitCurve = new THREE.EllipseCurve(
        0, 0,
        data.orbitRadius, data.orbitRadius,
        0, 2 * Math.PI,
        false,
        0
      );
      const points = orbitCurve.getPoints(120);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
      );
      const orbitMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(data.primaryColor),
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending
      });
      const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
      orbitLine.rotation.x = this.blackHoleGroup.rotation.x;
      orbitLine.rotation.z = this.blackHoleGroup.rotation.z;
      this.orbitsGroup.add(orbitLine);

      // 2. Planet Container
      const planetGroup = new THREE.Group();

      // Planet Surface Texture (Procedural Canvas)
      const planetTexture = this.createPlanetCanvasTexture(data.primaryColor, data.glowColor);

      const planetGeo = new THREE.SphereGeometry(data.size, 32, 32);
      const planetMat = new THREE.MeshStandardMaterial({
        map: planetTexture,
        roughness: 0.45,
        metalness: 0.15,
        emissive: new THREE.Color(data.primaryColor),
        emissiveIntensity: 0.25
      });
      const planetMesh = new THREE.Mesh(planetGeo, planetMat);
      planetMesh.userData = data;

      // 3. Glowing Atmospheric Corona
      const atmoGeo = new THREE.SphereGeometry(data.size * 1.25, 24, 24);
      const atmoMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(data.glowColor),
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending
      });
      const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
      planetGroup.add(atmoMesh);

      // 4. Volumetric Particle Ring System (Like Saturn for Systime & Blazor)
      if (data.hasRings) {
        const ringParticleCount = 2800;
        const ringGeo = new THREE.BufferGeometry();
        const rPos = new Float32Array(ringParticleCount * 3);
        const rCol = new Float32Array(ringParticleCount * 3);
        const rInner = data.size * 1.45;
        const rOuter = data.size * 2.8;
        const ringCol = new THREE.Color(data.glowColor);

        for (let j = 0; j < ringParticleCount; j++) {
          const j3 = j * 3;
          const dist = rInner + Math.random() * (rOuter - rInner);
          // Cassini gap effect
          if (dist > (rInner + rOuter) * 0.48 && dist < (rInner + rOuter) * 0.54) {
            continue;
          }
          const theta = Math.random() * Math.PI * 2;
          rPos[j3] = Math.cos(theta) * dist;
          rPos[j3 + 1] = (Math.random() - 0.5) * 0.02;
          rPos[j3 + 2] = Math.sin(theta) * dist;

          rCol[j3] = ringCol.r;
          rCol[j3 + 1] = ringCol.g;
          rCol[j3 + 2] = ringCol.b;
        }

        ringGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
        ringGeo.setAttribute('color', new THREE.BufferAttribute(rCol, 3));

        const ringMat = new THREE.PointsMaterial({
          size: 0.018,
          sizeAttenuation: true,
          vertexColors: true,
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending
        });

        const ringPoints = new THREE.Points(ringGeo, ringMat);
        ringPoints.rotation.x = Math.PI / 3.2;
        planetGroup.add(ringPoints);
      }

      planetGroup.add(planetMesh);
      this.orbitsGroup.add(planetGroup);

      this.planetMeshes.push({
        group: planetGroup,
        mesh: planetMesh,
        atmo: atmoMesh,
        data: data
      });
    });

    this.scene.add(this.orbitsGroup);
  }

  createPlanetCanvasTexture(c1, c2) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base background
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, 256, 256);

    // Procedural bands/noise
    for (let y = 0; y < 256; y += 4) {
      const alpha = 0.2 + Math.sin(y * 0.08) * 0.15;
      ctx.fillStyle = c2;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillRect(0, y, 256, 4);
    }

    ctx.globalAlpha = 1.0;
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mousePointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mousePointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    window.addEventListener('click', (e) => {
      // Don't trigger 3D raycast if clicking UI HUD elements
      if (e.target.closest('.hud-header, .orbit-dock, .project-dossier, .cv-modal, button, a')) {
        return;
      }
      this.checkPlanetClick();
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  checkPlanetClick() {
    this.raycaster.setFromCamera(this.mousePointer, this.camera);
    const meshes = this.planetMeshes.map(p => p.mesh);
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const data = hit.userData;
      if (data && data.id) {
        this.focusProject(data.id);
      }
    }
  }

  focusProject(projectId) {
    if (!projectId || projectId === 'singularidad') {
      this.cameraMode = 'orbit-overview';
      this.activeProject = null;
      this.targetCameraPos.set(0, 6.5, 15.5);
      this.targetControlsTarget.set(0, 0, 0);

      if (this.onProjectSelect) {
        this.onProjectSelect(null);
      }
      return;
    }

    const item = this.planetMeshes.find(p => p.data.id === projectId);
    if (!item) return;

    this.activeProject = item;
    this.cameraMode = 'focus-project';

    if (this.onProjectSelect) {
      this.onProjectSelect(item.data);
    }
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // 1. Accretion Disk Physics (Keplerian differential rotation)
    if (this.accretionGeo && this.particleAngles) {
      const pos = this.accretionGeo.attributes.position.array;
      const count = this.particleAngles.length;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        this.particleAngles[i] += this.particleSpeeds[i];
        const r = this.particleRadii[i];
        const a = this.particleAngles[i];

        pos[i3] = Math.cos(a) * r;
        pos[i3 + 2] = Math.sin(a) * r;
      }
      this.accretionGeo.attributes.position.needsUpdate = true;
    }

    // 2. Lensing Arch subtle breathing
    if (this.lensingArch) {
      this.lensingArch.rotation.z += 0.003;
    }
    if (this.verticalHalo) {
      this.verticalHalo.rotation.z += 0.0015;
    }

    // 3. Move Celestial Projects along their orbits
    this.planetMeshes.forEach((item) => {
      // Planet orbital progression
      item.data.angle += item.data.speed;
      const localX = Math.cos(item.data.angle) * item.data.orbitRadius;
      const localZ = Math.sin(item.data.angle) * item.data.orbitRadius;

      // Transform to match black hole equatorial plane tilt
      const tiltedVec = new THREE.Vector3(localX, 0, localZ);
      tiltedVec.applyEuler(this.blackHoleGroup.rotation);

      item.group.position.copy(tiltedVec);

      // Self rotation on axis
      item.mesh.rotation.y += 0.015;

      // Atmosphere breathing
      const atmoScale = 1 + Math.sin(Date.now() * 0.003 + item.data.orbitRadius) * 0.06;
      item.atmo.scale.set(atmoScale, atmoScale, atmoScale);
    });

    // 4. Camera Dynamics & Smooth Flight Lerp
    if (this.cameraMode === 'focus-project' && this.activeProject) {
      const pPos = this.activeProject.group.position;
      // Position camera offset to side of planet facing center
      const camOffset = new THREE.Vector3(1.2, 0.6, 1.8);
      this.targetCameraPos.copy(pPos).add(camOffset);
      this.targetControlsTarget.copy(pPos);

      this.camera.position.lerp(this.targetCameraPos, 0.05);
      this.controls.target.lerp(this.targetControlsTarget, 0.05);
    } else if (this.cameraMode === 'orbit-overview') {
      this.camera.position.lerp(this.targetCameraPos, 0.04);
      this.controls.target.lerp(this.targetControlsTarget, 0.04);
    }

    // 5. Starfield rotation
    if (this.starfield) {
      this.starfield.rotation.y += 0.0002;
    }

    this.controls.update();

    // Hover Cursor check
    this.raycaster.setFromCamera(this.mousePointer, this.camera);
    const meshes = this.planetMeshes.map(p => p.mesh);
    const hits = this.raycaster.intersectObjects(meshes, false);
    if (hits.length > 0) {
      document.body.style.cursor = 'pointer';
    } else if (!document.body.style.cursor || document.body.style.cursor === 'pointer') {
      document.body.style.cursor = 'default';
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
