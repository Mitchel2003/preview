import * as THREE from 'three';

export class CosmicGalaxy {
  constructor(containerId = 'webgl-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`Container #${containerId} not found.`);
      return;
    }

    this.isMobile = window.innerWidth < 768;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollY = 0;
    this.targetScrollProgress = 0;
    this.scrollProgress = 0;

    // Orbital projects definition
    this.projectNodesData = [
      {
        id: 'systime',
        name: 'Systime Enterprise',
        badge: 'Producción Activa',
        color: 0x10b981,
        radius: 3.3,
        speed: 0.0075,
        angle: 0.5,
        targetCardId: 'systems'
      },
      {
        id: 'sysmed',
        name: 'Sysmed / Ingest',
        badge: 'Biomédico & INVIMA',
        color: 0x8b5cf6,
        radius: 4.3,
        speed: 0.0055,
        angle: 2.1,
        targetCardId: 'systems'
      },
      {
        id: 'blazor',
        name: 'Blazor & MAUI DDD',
        badge: 'Clean Architecture',
        color: 0x00f5ff,
        radius: 5.2,
        speed: 0.0042,
        angle: 3.8,
        targetCardId: 'systems'
      },
      {
        id: 'rpa',
        name: 'RPA & Win32 Bots',
        badge: 'Automation Systems',
        color: 0xf59e0b,
        radius: 6.2,
        speed: 0.0032,
        angle: 5.2,
        targetCardId: 'systems'
      }
    ];

    this.focusedNode = null;
    this.warpFactor = 0;
    this.targetWarpFactor = 0;

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x03050c, 0.045);

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      150
    );
    this.camera.position.set(0, 4.2, 9.5);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x02040a, 1);
    this.container.appendChild(this.renderer.domElement);

    this.particleTexture = this.generateParticleTexture();

    // 1. Black Hole Singularity & Photon Corona
    this.createBlackHole();

    // 2. Accretion Disk (Saturn / Gargantua particle swarm)
    this.createAccretionDisk();

    // 3. Deep Starfield Background
    this.createStarfield();

    // 4. Orbiting Project Nodes & Planetary Rings
    this.createProjectNodes();

    // 5. Raycasting for interactive node hover/clicks
    this.raycaster = new THREE.Raycaster();
    this.mousePointer = new THREE.Vector2(-100, -100);

    this.bindEvents();
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  generateParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(220, 245, 255, 0.9)');
    gradient.addColorStop(0.6, 'rgba(0, 245, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  createBlackHole() {
    this.blackHoleGroup = new THREE.Group();

    // Event Horizon (Absolute Black Sphere)
    const horizonGeo = new THREE.SphereGeometry(1.25, 48, 48);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x000000
    });
    this.eventHorizon = new THREE.Mesh(horizonGeo, horizonMat);
    this.blackHoleGroup.add(this.eventHorizon);

    // Relativistic Photon Ring (Blazing Corona)
    const ringGeo = new THREE.RingGeometry(1.26, 1.45, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.photonRing = new THREE.Mesh(ringGeo, ringMat);
    this.photonRing.rotation.x = Math.PI / 2;
    this.blackHoleGroup.add(this.photonRing);

    // Secondary Outer Glow Halo
    const haloGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending
    });
    this.haloMesh = new THREE.Mesh(haloGeo, haloMat);
    this.blackHoleGroup.add(this.haloMesh);

    this.scene.add(this.blackHoleGroup);
  }

  createAccretionDisk() {
    const particleCount = this.isMobile ? 28000 : 55000;
    this.accretionGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    this.particleRadii = new Float32Array(particleCount);
    this.particleAngles = new Float32Array(particleCount);
    this.particleSpeeds = new Float32Array(particleCount);

    const colorHot = new THREE.Color(0xffffff);
    const colorCyan = new THREE.Color(0x00f5ff);
    const colorViolet = new THREE.Color(0x8b5cf6);
    const colorAmber = new THREE.Color(0xf59e0b);

    const minR = 1.45;
    const maxR = 6.8;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Exponential distribution denser near event horizon
      const r = minR + Math.pow(Math.random(), 1.7) * (maxR - minR);
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 0.18 * (r / maxR);

      positions[i3] = Math.cos(angle) * r;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * r;

      this.particleRadii[i] = r;
      this.particleAngles[i] = angle;
      // Relativistic Keplerian speed: inner orbit much faster than outer
      this.particleSpeeds[i] = (0.015 / Math.sqrt(r)) * (0.85 + Math.random() * 0.3);

      // Color based on radial distance
      const normR = (r - minR) / (maxR - minR);
      const col = new THREE.Color();
      if (normR < 0.15) {
        col.lerpColors(colorHot, colorCyan, normR / 0.15);
      } else if (normR < 0.55) {
        col.lerpColors(colorCyan, colorViolet, (normR - 0.15) / 0.4);
      } else {
        col.lerpColors(colorViolet, colorAmber, (normR - 0.55) / 0.45);
      }

      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    this.accretionGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.accretionGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.accretionMaterial = new THREE.PointsMaterial({
      size: this.isMobile ? 0.022 : 0.018,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.92
    });

    this.accretionDisk = new THREE.Points(this.accretionGeometry, this.accretionMaterial);
    // Slight aesthetic tilt like Gargantua's disk
    this.accretionDisk.rotation.x = 0.22;
    this.accretionDisk.rotation.z = -0.15;
    this.scene.add(this.accretionDisk);
  }

  createStarfield() {
    const starCount = this.isMobile ? 5000 : 12000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(starCount * 3);
    const cols = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const r = 25 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);

      const bright = 0.5 + Math.random() * 0.5;
      cols[i3] = bright * 0.8;
      cols[i3 + 1] = bright * 0.9;
      cols[i3 + 2] = bright;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.025,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.65
    });

    this.starfield = new THREE.Points(geo, mat);
    this.scene.add(this.starfield);
  }

  createProjectNodes() {
    this.projectMeshes = [];
    this.projectGroup = new THREE.Group();

    this.projectNodesData.forEach((data) => {
      const nodeGroup = new THREE.Group();

      // 1. Orbital Track Line
      const orbitCurve = new THREE.EllipseCurve(
        0, 0,
        data.radius, data.radius,
        0, 2 * Math.PI,
        false,
        0
      );
      const points = orbitCurve.getPoints(80);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
      );
      const orbitMat = new THREE.LineBasicMaterial({
        color: data.color,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending
      });
      const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
      orbitLine.rotation.x = this.accretionDisk.rotation.x;
      orbitLine.rotation.z = this.accretionDisk.rotation.z;
      this.scene.add(orbitLine);

      // 2. Planetoid Node (Core Sphere)
      const planetGeo = new THREE.SphereGeometry(0.18, 24, 24);
      const planetMat = new THREE.MeshBasicMaterial({
        color: data.color
      });
      const planetMesh = new THREE.Mesh(planetGeo, planetMat);
      planetMesh.userData = data;

      // 3. Saturn-like Concentric Rings
      const ringGeo = new THREE.RingGeometry(0.24, 0.42, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: data.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2.3;
      planetMesh.add(ringMesh);

      // 4. Outer Beacon Pulse Aura
      const auraGeo = new THREE.SphereGeometry(0.28, 16, 16);
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      const auraMesh = new THREE.Mesh(auraGeo, auraMat);
      planetMesh.add(auraMesh);

      nodeGroup.add(planetMesh);
      this.projectGroup.add(nodeGroup);

      this.projectMeshes.push({
        group: nodeGroup,
        mesh: planetMesh,
        aura: auraMesh,
        data: data
      });
    });

    this.projectGroup.rotation.x = this.accretionDisk.rotation.x;
    this.projectGroup.rotation.z = this.accretionDisk.rotation.z;
    this.scene.add(this.projectGroup);
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;

      this.mousePointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mousePointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 1.5;
        this.mouse.targetY = (e.touches[0].clientY / window.innerHeight - 0.5) * 1.5;
      }
    }, { passive: true });

    window.addEventListener('scroll', () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      this.targetScrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    }, { passive: true });

    window.addEventListener('click', () => {
      this.checkNodeIntersection(true);
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  checkNodeIntersection(isClick = false) {
    if (!this.projectMeshes || this.projectMeshes.length === 0) return;

    this.raycaster.setFromCamera(this.mousePointer, this.camera);
    const meshes = this.projectMeshes.map(p => p.mesh);
    const intersects = this.raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const targetData = hit.userData?.id ? hit.userData : hit.parent?.userData;

      document.body.style.cursor = 'pointer';

      if (isClick && targetData) {
        this.triggerWarp(900);
        const cardTarget = document.getElementById(targetData.targetCardId);
        if (cardTarget) {
          cardTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else {
      document.body.style.cursor = 'default';
    }
  }

  triggerWarp(durationMs = 900) {
    this.targetWarpFactor = 1;
    setTimeout(() => {
      this.targetWarpFactor = 0;
    }, durationMs);
  }

  setCameraFocus(mode = 'overview') {
    this.triggerWarp(700);
    switch (mode) {
      case 'systems':
        // Dive into the orbital plane around the black hole!
        this.targetCam = { x: 0, y: 1.8, z: 6.2, lookX: 0, lookY: 0, lookZ: 0 };
        break;
      case 'architecture':
        this.targetCam = { x: -3.2, y: 2.8, z: 5.6, lookX: 0, lookY: 0.2, lookZ: 0 };
        break;
      case 'timeline':
        this.targetCam = { x: 0, y: 5.2, z: 4.8, lookX: 0, lookY: 0, lookZ: 0 };
        break;
      case 'overview':
      default:
        this.targetCam = { x: 0, y: 4.2, z: 9.5, lookX: 0, lookY: 0, lookZ: 0 };
        break;
    }
  }

  highlightNode(nodeId) {
    if (!this.projectMeshes) return;
    this.projectMeshes.forEach(item => {
      if (item.data.id === nodeId) {
        item.aura.scale.set(1.8, 1.8, 1.8);
        item.mesh.scale.set(1.3, 1.3, 1.3);
      } else {
        item.mesh.scale.set(1, 1, 1);
      }
    });
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Mouse interpolation
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Scroll progress interpolation
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.06;

    // Warp factor interpolation
    this.warpFactor += (this.targetWarpFactor - this.warpFactor) * 0.08;

    // 1. Accretion Disk Physics & Swirling
    if (this.accretionGeometry && this.particleAngles) {
      const pos = this.accretionGeometry.attributes.position.array;
      const count = this.particleAngles.length;
      const speedMultiplier = 1 + (this.warpFactor * 4);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        this.particleAngles[i] += this.particleSpeeds[i] * speedMultiplier;
        const r = this.particleRadii[i];
        const a = this.particleAngles[i];

        pos[i3] = Math.cos(a) * r;
        pos[i3 + 2] = Math.sin(a) * r;
      }
      this.accretionGeometry.attributes.position.needsUpdate = true;
    }

    // 2. Black Hole Rotation & Pulsing
    if (this.photonRing) {
      this.photonRing.rotation.z += 0.008;
    }
    if (this.haloMesh) {
      const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.06;
      this.haloMesh.scale.set(pulse, pulse, pulse);
    }

    // 3. Orbiting Projects Movement
    this.projectMeshes.forEach((item) => {
      item.data.angle += item.data.speed * (1 + this.warpFactor * 3);
      const x = Math.cos(item.data.angle) * item.data.radius;
      const z = Math.sin(item.data.angle) * item.data.radius;

      item.mesh.position.set(x, 0, z);

      // Subtle beacon breathing
      const beaconScale = 1 + Math.sin(Date.now() * 0.004 + item.data.radius) * 0.12;
      item.aura.scale.set(beaconScale, beaconScale, beaconScale);
    });

    // 4. Starfield Drift
    if (this.starfield) {
      this.starfield.rotation.y += 0.0003;
    }

    // 5. Scroll-driven Dynamic Camera Choreography
    // When scroll reaches ~0.3 - 0.5 (middle section with projects),
    // camera descends directly into the orbital plane!
    const midScrollFactor = Math.sin(Math.min(Math.max(this.scrollProgress * Math.PI, 0), Math.PI));

    const baseCamY = 4.2 - (this.scrollProgress * 2.2) - (midScrollFactor * 1.5);
    const baseCamZ = 9.5 - (midScrollFactor * 3.5);

    if (!this.targetCam) {
      this.camera.position.x += (this.mouse.x * 0.8 - this.camera.position.x) * 0.05;
      this.camera.position.y += (baseCamY - this.mouse.y * 0.5 - this.camera.position.y) * 0.05;
      this.camera.position.z += (baseCamZ - this.camera.position.z) * 0.05;
      this.camera.lookAt(0, 0, 0);
    } else {
      this.camera.position.x += (this.targetCam.x + this.mouse.x * 0.5 - this.camera.position.x) * 0.05;
      this.camera.position.y += (this.targetCam.y - this.mouse.y * 0.4 - this.camera.position.y) * 0.05;
      this.camera.position.z += (this.targetCam.z - this.camera.position.z) * 0.05;
      this.camera.lookAt(this.targetCam.lookX, this.targetCam.lookY, this.targetCam.lookZ);
    }

    this.checkNodeIntersection(false);
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
