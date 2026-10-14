/* ==========================================================================
   عبدالرحمن الشريف — Portfolio | script.js
   Vanilla ES6. Loaded with `defer`, so the DOM is ready when this runs.
   Structured in independent numbered blocks (mirrors the site's sections)
   so each can be lifted into its own React component/hook later.
   Functions referenced by inline HTML handlers (openModal, closeModal,
   handleFormSubmit) are intentionally kept on the global scope.
   ========================================================================== */


    // 0. Organic Liquid Fluid Mesh WebGL Engine
    (function initFluidBackground() {
      const canvas = document.getElementById('webgl-liquid-canvas');
      if (!canvas) return;
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return;

      const vertexShaderSource = `
        attribute vec2 position;
        varying vec2 vUv;
        void main() {
          vUv = (position + 1.0) * 0.5;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      const fragmentShaderSource = `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        varying vec2 vUv;

        // Colors palette: #F4EFF3, #DCD3E0, #B7AFC9, #8A82A6
        const vec3 c1 = vec3(0.957, 0.937, 0.953); // #F4EFF3
        const vec3 c2 = vec3(0.863, 0.827, 0.878); // #DCD3E0
        const vec3 c3 = vec3(0.718, 0.686, 0.788); // #B7AFC9
        const vec3 c4 = vec3(0.541, 0.510, 0.651); // #8A82A6

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m;
          m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          vec2 st = gl_FragCoord.xy / u_resolution.xy;
          float aspect = u_resolution.x / u_resolution.y;
          st.x *= aspect;

          vec2 mouse = u_mouse / u_resolution.xy;
          mouse.x *= aspect;

          float distToMouse = distance(st, mouse);
          float mouseWave = sin(distToMouse * 16.0 - u_time * 2.8) * exp(-distToMouse * 3.0) * 0.08;

          float t = u_time * 0.22;
          vec2 q = vec2(0.0);
          q.x = snoise(st * 1.5 + vec2(t * 0.5, t * 0.3));
          q.y = snoise(st * 1.5 + vec2(t * 0.4, -t * 0.2));

          vec2 r = vec2(0.0);
          r.x = snoise(st * 2.2 + 1.2 * q + vec2(1.7, 9.2) + 0.15 * t + mouseWave);
          r.y = snoise(st * 2.2 + 1.2 * q + vec2(8.3, 2.8) + 0.126 * t + mouseWave);

          float f = snoise(st * 1.4 + r + mouseWave);
          f = clamp(f * 0.5 + 0.5, 0.0, 1.0);

          vec3 color = mix(c1, c2, clamp(length(q), 0.0, 1.0));
          color = mix(color, c3, clamp(length(r.x), 0.0, 1.0));
          color = mix(color, c4, clamp(f * f * 1.1, 0.0, 1.0));

          // Soft light reflection & highlight ripple
          float highlight = pow(clamp(f + mouseWave * 1.2, 0.0, 1.0), 3.5) * 0.25;
          color += vec3(highlight);

          gl_FragColor = vec4(color, 0.94);
        }
      `;

      function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
      }

      const program = gl.createProgram();
      gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexShaderSource));
      gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource));
      gl.linkProgram(program);
      gl.useProgram(program);

      const positionLocation = gl.getAttribLocation(program, 'position');
      const timeLocation = gl.getUniformLocation(program, 'u_time');
      const resLocation = gl.getUniformLocation(program, 'u_resolution');
      const mouseLocation = gl.getUniformLocation(program, 'u_mouse');

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]), gl.STATIC_DRAW);

      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      let mouseX = window.innerWidth * 0.5;
      let mouseY = window.innerHeight * 0.5;
      let targetMouseX = mouseX;
      let targetMouseY = mouseY;

      window.addEventListener('mousemove', (e) => {
        targetMouseX = e.clientX;
        targetMouseY = window.innerHeight - e.clientY;
      });

      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      window.addEventListener('resize', resize);
      resize();

      const startTime = performance.now();
      function render() {
        const currentTime = (performance.now() - startTime) * 0.001;
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        gl.uniform1f(timeLocation, currentTime);
        gl.uniform2f(resLocation, canvas.width, canvas.height);
        gl.uniform2f(mouseLocation, mouseX * (canvas.width / window.innerWidth), mouseY * (canvas.height / window.innerHeight));

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
      }
      render();
    })();

    // 1. Portfolio Category Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('bg-on-surface', 'text-surface', 'shadow-[0_4px_12px_rgba(58,51,80,0.2)]');
          b.classList.add('text-on-surface-variant');
        });
        btn.classList.remove('text-on-surface-variant');
        btn.classList.add('bg-on-surface', 'text-surface', 'shadow-[0_4px_12px_rgba(58,51,80,0.2)]');

        const filter = btn.getAttribute('data-filter');
        projectCards.forEach(card => {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // 2. Intersection Observer for Scroll Fade-up Entry of Cards
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    };

    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('fade-up-active');
          }, idx * 140);
          cardObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-up-init').forEach(card => {
      cardObserver.observe(card);
    });

    // 3. Interactive 3D Parallax Tilt with Hero Area Mouse Tracking
    const heroSection = document.getElementById('hero');
    const tiltCard = document.getElementById('hero-tilt-card');
    let currentRotateX = 0;
    let currentRotateY = 0;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let isMouseOverHero = false;

    if (heroSection && tiltCard) {
      heroSection.addEventListener('mousemove', (e) => {
        isMouseOverHero = true;
        const rect = heroSection.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        targetRotateX = -y * 22;
        targetRotateY = x * 24;
      });

      heroSection.addEventListener('mouseleave', () => {
        isMouseOverHero = false;
        targetRotateX = 0;
        targetRotateY = 0;
      });

      function updateTilt() {
        currentRotateX += (targetRotateX - currentRotateX) * 0.08;
        currentRotateY += (targetRotateY - currentRotateY) * 0.08;

        const scale = isMouseOverHero ? 1.025 : 1.0;
        tiltCard.style.transform = `rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;

        requestAnimationFrame(updateTilt);
      }
      updateTilt();
    }

    // 4. Enhanced Rich Project Detail Modal System
    const projectsData = {
      aurum: {
        title: "هوية Aurum & Clay الفاخرة",
        tagline: "صياغة التراث الخزفي ببريق الذهب الخافت والورق الإيطالي النادر",
        tag: "هوية بصرية ونحتية",
        year: "٢٠٢٤",
        discipline: "Haute Branding & Print",
        mainImg: "3.png",
        gallery: [
          "3.png",
          "3.png",
          "3.png"
        ],
        desc: "تطوير شامل ومخصص لهوية دار الحلي والخزف الملكية. ركز التصميم على تخليد الملمس الحسي عبر استخدام ورق قطني إيطالي معتق مع طباعة غائرة (Debossing) وختم الشمع البنفسجي، متناغماً مع الخط العربي السنبلي المنحوت بحرفية متناهية ليبرز أصالة الدار في الأسواق العالمية.",
        materials: "ورق قطني يدوي 450gsm، رقائق الذهب الوردي الخافت، حبر صبغي عضوي، وأختام شمعية مصهورة يدوياً.",
        client: "مجموعة Aurum الدولية",
        duration: "٨ أسابيع",
        award: "جائزة التميز الطبوغرافي ٢٠٢٤",
        fontAr: "Cairo Haute Custom Serif",
        fontEn: "Tajawal Geometric Arabic",
        fontWeights: "الأوزان: 700 Bold, 800 ExtraBold, 900 Black",
        typeNature: "أحرف عربية مستلهمة من خط التعليق والسنبلي بروح حداثية متوازنة"
      },
      neobank: {
        title: "تطبيق Neo Bank الرقمي فائق النعومة",
        tagline: "هندسة واجهات مصرفية زجاجية تمنح المستثمر السكينة والوضوح الكامل",
        tag: "واجهات وتجارب مستخدم (UI/UX)",
        year: "٢٠٢٤",
        discipline: "Digital FinTech UI/UX",
        mainImg: "4.png",
        gallery: [
          "4.png",
          "4.png",
          "4.png"
        ],
        desc: "إعادة صياغة التجربة المصرفية الخاصة للأثرياء ورجال الأعمال. اعتمدت المنظومة فلسفة (Frosted Tactile Architecture) عبر بطاقات شبه شفافة وطبقات عمق تحاكي الزجاج المصقول لتقديم تحليلات مالية متقدمة دون أي إرهاق بصري، مع تفاعلات حركية فائقة السرعة تتناغم مع حركة الأصابع.",
        materials: "Figma Prototyping Tokens، مكونات زجاجية ثلاثية الأبعاد بـ WebGL، وتوافق كامل مع المعايير المصرفية العالمية.",
        client: "بنك المستقبل الرقمي",
        duration: "١٢ أسبوع",
        award: "Best FinTech UX 2024",
        fontAr: "Cairo Sans Variable Display",
        fontEn: "Tajawal Clean Humanist",
        fontWeights: "الأوزان: 500 Medium, 700 Bold, 800 ExtraBold",
        typeNature: "أرقام مصرفية بنسب متساوية (Tabular Figures) وحروف عربية واضحة المعالم"
      },
      alchemy: {
        title: "ملصق معرض فنون الخيمياء الحديثة",
        tagline: "تجسيد التحول الفيزيائي للمادة والكروم السائل في سياق الطبوغرافيا العربية المعاصرة",
        tag: "إخراج فني وطباعة ثلاثية الأبعاد",
        year: "٢٠٢٣",
        discipline: "3D Art & Exhibition Design",
        mainImg: "5.png",
        gallery: [
          "5.png",
          "5.png",
          "5.png"
        ],
        desc: "ملصق فني طليعي لمعرض الفن التجريدي المعاصر، يجمع بين انكسارات الكروم السائل وانعكاسات الزجاج الليلكي المنحوت. يطرح العمل تساؤلاً فلسفياً حول نقطة التقاء المادة الكلاسيكية مع الذكاء الاصطناعي، عبر خط عربي تجريدي منحوت بالأبعاد الثلاثية باستخدام ريندر Octane فائق الواقعية.",
        materials: "طباعة سلك سكرين فوتوغرافية، أحبار عاكسة للضوء على ألواح ألمنيوم مصقولة بحجم 100x150cm.",
        client: "بينالي دبي للفنون",
        duration: "٤ أسابيع",
        award: "Poster Design Annual Gold",
        fontAr: "Sculptural Avant-Garde Arabic",
        fontEn: "Cairo Bold Architectural",
        fontWeights: "الأوزان: 800 Bold, Custom 3D Polygons",
        typeNature: "نحت طبوغرافي ثلاثي الأبعاد مستوحى من خط الكوفي الهندسي الملتف"
      }
    };

    const modal = document.getElementById('project-modal');
    const modalContainer = document.getElementById('modal-container');

    function openModal(id) {
      const data = projectsData[id];
      if (!data) return;

      // Populate Text & Metadata
      document.getElementById('modal-title').textContent = data.title;
      document.getElementById('modal-tagline').textContent = data.tagline;
      document.getElementById('modal-tag').textContent = data.tag;
      document.getElementById('modal-year').textContent = data.year;
      document.getElementById('modal-client').textContent = data.client;
      document.getElementById('modal-duration').textContent = data.duration;
      document.getElementById('modal-discipline').textContent = data.discipline;
      document.getElementById('modal-award').textContent = data.award;
      document.getElementById('modal-desc').textContent = data.desc;
      document.getElementById('modal-materials').textContent = data.materials;
      document.getElementById('modal-font-ar').textContent = data.fontAr;
      document.getElementById('modal-font-en').textContent = data.fontEn;
      document.getElementById('modal-font-weights').textContent = data.fontWeights;
      document.getElementById('modal-type-nature').textContent = data.typeNature;

      // Primary Image
      const mainImg = document.getElementById('modal-img');
      mainImg.src = data.mainImg;

      // Thumbnails setup
      const thumbsContainer = document.getElementById('modal-thumbnails');
      thumbsContainer.innerHTML = '';
      data.gallery.forEach((thumbSrc, index) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.className = `w-16 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${index === 0 ? 'border-primary ring-2 ring-primary/40 scale-105' : 'border-white/60 opacity-70 hover:opacity-100 hover:border-white'}`;
        thumbBtn.innerHTML = `<img src="${thumbSrc}" class="w-full h-full object-cover pointer-events-none" alt="صورة توضيحية ${index + 1}">`;
        thumbBtn.onclick = () => {
          mainImg.src = thumbSrc;
          Array.from(thumbsContainer.children).forEach(btn => {
            btn.className = 'w-16 h-12 rounded-xl overflow-hidden border-2 border-white/60 opacity-70 hover:opacity-100 hover:border-white transition-all cursor-pointer flex-shrink-0';
          });
          thumbBtn.className = 'w-16 h-12 rounded-xl overflow-hidden border-2 border-primary ring-2 ring-primary/40 scale-105 transition-all cursor-pointer flex-shrink-0';
        };
        thumbsContainer.appendChild(thumbBtn);
      });

      // Show overlay with silky elastic entrance
      modal.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
      modal.classList.add('opacity-100', 'visible', 'pointer-events-auto');
      modal.setAttribute('aria-hidden', 'false');

      // Prevent main page scrolling
      document.body.style.overflow = 'hidden';

      // Elastic Scale & Blur Removal
      requestAnimationFrame(() => {
        modalContainer.classList.remove('scale-[0.92]', 'blur-sm', 'opacity-0');
        modalContainer.classList.add('scale-100', 'blur-0', 'opacity-100');
      });
    }

    function closeModal() {
      // Scale out and fade
      modalContainer.classList.remove('scale-100', 'blur-0', 'opacity-100');
      modalContainer.classList.add('scale-[0.92]', 'blur-sm', 'opacity-0');

      modal.classList.remove('opacity-100', 'pointer-events-auto');
      modal.classList.add('opacity-0', 'pointer-events-none');
      modal.setAttribute('aria-hidden', 'true');

      // Re-enable page scrolling
      document.body.style.overflow = '';

      setTimeout(() => {
        modal.classList.add('invisible');
      }, 350);
    }

    // Backdrop click dismiss
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Keyboard ESC key dismiss
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });

    // 5. Contact Form Feedback Toast
    function handleFormSubmit(e) {
      e.preventDefault();
      alert("شكراً لتواصلك الراقي. تم استلام تفاصيل رؤيتك وسأقوم بالرد خلال ٤٨ ساعة عمل.");
      e.target.reset();
    }
  
// 6. Responsive Mobile Drawer (open/close, backdrop dismiss, ESC, focus trap, scroll lock)
(function initMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const panel = document.getElementById('drawer-panel');
  const backdrop = document.getElementById('drawer-backdrop');
  const openBtn = document.getElementById('drawer-open-btn');
  const closeBtn = document.getElementById('drawer-close-btn');
  if (!drawer || !panel || !backdrop || !openBtn || !closeBtn) return;

  const drawerLinks = drawer.querySelectorAll('[data-drawer-nav] a');
  let lastFocusedEl = null;

  function openDrawer() {
    lastFocusedEl = document.activeElement;
    drawer.classList.add('drawer-open');
    drawer.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('drawer-locked');
    closeBtn.focus();
  }

  function closeDrawer() {
    drawer.classList.remove('drawer-open');
    drawer.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-locked');
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);

  // Dismiss on backdrop tap
  backdrop.addEventListener('click', closeDrawer);

  // Dismiss on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('drawer-open')) {
      closeDrawer();
    }
  });

  // Dismiss automatically once a destination is chosen
  drawerLinks.forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });

  // Basic focus trap while the drawer is open
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = panel.querySelectorAll('a[href], button:not([disabled])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Collapse the drawer automatically if the viewport grows past the mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && drawer.classList.contains('drawer-open')) {
      closeDrawer();
    }
  });
})();

// 7. Active Section Highlighting (syncs desktop nav + drawer nav via IntersectionObserver)
(function initActiveSectionSync() {
  const sections = ['hero', 'about', 'portfolio', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;

  const navLinks = document.querySelectorAll('nav a[data-path], [data-drawer-nav] a[data-path]');

  function setActive(path) {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('data-path') === path;
      link.classList.toggle('bg-secondary-container/90', isActive);
      link.classList.toggle('text-on-secondary-fixed', isActive);
      link.classList.toggle('text-on-surface-variant', !isActive);
    });
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const path = entry.target.id === 'hero' ? 'home' : entry.target.id;
          setActive(path);
        }
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach((section) => sectionObserver.observe(section));
})();
