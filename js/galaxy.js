import * as THREE from 'three';

export class CosmicGalaxy {
  constructor(containerId = 'webgl-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`Container #${containerId} not found.`);
      return;
    }

    this.isMobile = window.innerWidth < 768;
    this.params = {
      count: this.isMobile ? 32000 : 75000,
      size: this.isMobile ? 0.014 : 0.011,
      radius: 6.8,
      branches: 4,
      spin: 1.35,
      randomness: 0.45,
      power: 3.5,
      insideColor: '#00f5ff',
      outsideColor: '#7b2cbf',
      coreColor: '#ffffff',
      starfieldCount: this.isMobile ? 6000 : 18000
    };

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.warpFactor = 0;
    this.targetWarpFactor = 0;
    this.baseSpeed = 0.0008;

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050711, 0.055);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 3.5, 5.8);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: false,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x04060d, 1);
    this.container.appendChild(this.renderer.domElement);

    this.particleTexture = this.generateParticleTexture();

    this.generateGalaxy();
    this.generateStarfield();
    this.generateCosmicCore();

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
    gradient.addColorStop(0.2, 'rgba(240, 250, 255, 0.85)');
    gradient.addColorStop(0.5, 'rgba(0, 245, 255, 0.35)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  generateGalaxy() {
    if (this.galaxyPoints) {
      this.galaxyGeometry.dispose();
      this.galaxyMaterial.dispose();
      this.scene.remove(this.galaxyPoints);
    }

    const { count, size, radius, branches, spin, randomness, power, insideColor, outsideColor, coreColor } = this.params;

    this.galaxyGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    const colorInside = new THREE.Color(insideColor);
    const colorOutside = new THREE.Color(outsideColor);
    const colorCore = new THREE.Color(coreColor);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), power) * radius;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const spinAngle = r * spin;

      const randomX = Math.pow(Math.random(), power) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
      const randomY = Math.pow(Math.random(), power) * (Math.random() < 0.5 ? 1 : -1) * (randomness * 0.4) * r;
      const randomZ = Math.pow(Math.random(), power) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

      positions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

      // Color interpolation: Core -> Inside -> Outside
      const mixedColor = colorInside.clone();
      const edgeFactor = r / radius;
      mixedColor.lerp(colorOutside, edgeFactor);

      if (r < radius * 0.18) {
        mixedColor.lerp(colorCore, 1 - (r / (radius * 0.18)));
      }

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      scales[i] = Math.random();
    }

    this.galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.galaxyGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    this.galaxyMaterial = new THREE.PointsMaterial({
      size: size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.95
    });

    this.galaxyPoints = new THREE.Points(this.galaxyGeometry, this.galaxyMaterial);
    this.scene.add(this.galaxyPoints);
  }

  generateStarfield() {
    const starCount = this.params.starfieldCount;
    this.starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = 18 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i3 + 2] = radius * Math.cos(phi);

      const tone = 0.65 + Math.random() * 0.35;
      const tint = Math.random();
      if (tint > 0.8) {
        starColors[i3] = 0.5 * tone;
        starColors[i3 + 1] = 0.8 * tone;
        starColors[i3 + 2] = 1.0 * tone; // Cyan-ish
      } else if (tint > 0.6) {
        starColors[i3] = 0.9 * tone;
        starColors[i3 + 1] = 0.6 * tone;
        starColors[i3 + 2] = 1.0 * tone; // Violet-ish
      } else {
        starColors[i3] = tone;
        starColors[i3 + 1] = tone;
        starColors[i3 + 2] = tone; // White
      }
    }

    this.starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    this.starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    this.starMaterial = new THREE.PointsMaterial({
      size: 0.022,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.7
    });

    this.starfield = new THREE.Points(this.starGeometry, this.starMaterial);
    this.scene.add(this.starfield);
  }

  generateCosmicCore() {
    const coreGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x80f0ff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.scene.add(this.coreMesh);
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 1.5;
        this.mouse.targetY = (e.touches[0].clientY / window.innerHeight - 0.5) * 1.5;
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  triggerWarp(durationMs = 900) {
    this.targetWarpFactor = 1;
    setTimeout(() => {
      this.targetWarpFactor = 0;
    }, durationMs);
  }

  setCameraFocus(mode = 'overview') {
    this.triggerWarp(600);
    switch (mode) {
      case 'systems':
        this.targetCam = { x: 2.2, y: 1.8, z: 4.2, lookX: 0.5, lookY: 0, lookZ: 0 };
        break;
      case 'architecture':
        this.targetCam = { x: -2.4, y: 2.1, z: 4.5, lookX: -0.5, lookY: 0, lookZ: 0 };
        break;
      case 'timeline':
        this.targetCam = { x: 0, y: 4.8, z: 3.8, lookX: 0, lookY: 0.2, lookZ: 0 };
        break;
      case 'overview':
      default:
        this.targetCam = { x: 0, y: 3.5, z: 5.8, lookX: 0, lookY: 0, lookZ: 0 };
        break;
    }
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Smooth mouse interpolation
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Warp factor interpolation
    this.warpFactor += (this.targetWarpFactor - this.warpFactor) * 0.08;

    // Speeds with warp acceleration
    const currentSpeed = this.baseSpeed + (this.warpFactor * 0.015);

    if (this.galaxyPoints) {
      this.galaxyPoints.rotation.y += currentSpeed;
      this.galaxyPoints.rotation.x = this.mouse.y * 0.25;
      this.galaxyPoints.rotation.z = -this.mouse.x * 0.25;
    }

    if (this.starfield) {
      this.starfield.rotation.y += currentSpeed * 0.15;
    }

    if (this.coreMesh) {
      const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.08;
      this.coreMesh.scale.set(pulse, pulse, pulse);
    }

    // Camera damping towards target
    if (this.targetCam) {
      this.camera.position.x += (this.targetCam.x + this.mouse.x * 0.4 - this.camera.position.x) * 0.05;
      this.camera.position.y += (this.targetCam.y - this.mouse.y * 0.3 - this.camera.position.y) * 0.05;
      this.camera.position.z += (this.targetCam.z - this.camera.position.z) * 0.05;
      this.camera.lookAt(this.targetCam.lookX, this.targetCam.lookY, this.targetCam.lookZ);
    } else {
      this.camera.position.x += (this.mouse.x * 0.6 - this.camera.position.x) * 0.05;
      this.camera.position.y += (3.5 - this.mouse.y * 0.4 - this.camera.position.y) * 0.05;
      this.camera.lookAt(0, 0, 0);
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
