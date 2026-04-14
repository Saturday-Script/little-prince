/**
 * 粒子星空配置 - 基于tsParticles
 */
const ParticlesConfig = {
  async init() {
    if (typeof tsParticles === 'undefined') return;

    await tsParticles.load("particles-bg", {
      fullScreen: false,
      background: {
        color: "transparent"
      },
      particles: {
        number: {
          value: 120,
          density: {
            enable: true,
            area: 800
          }
        },
        color: {
          value: ["#ffffff", "#a29bfe", "#fdcb6e", "#6c5ce7"]
        },
        shape: {
          type: "circle"
        },
        opacity: {
          value: { min: 0.1, max: 0.8 },
          animation: {
            enable: true,
            speed: 0.5,
            minimumValue: 0.1,
            sync: false
          }
        },
        size: {
          value: { min: 0.5, max: 3 },
          animation: {
            enable: true,
            speed: 1,
            minimumValue: 0.3,
            sync: false
          }
        },
        move: {
          enable: true,
          speed: 0.3,
          direction: "none",
          random: true,
          straight: false,
          outModes: "out"
        },
        twinkle: {
          particles: {
            enable: true,
            frequency: 0.03,
            opacity: 1,
            color: {
              value: "#fdcb6e"
            }
          }
        }
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "grab"
          }
        },
        modes: {
          grab: {
            distance: 140,
            links: {
              opacity: 0.2,
              color: "#a29bfe"
            }
          }
        }
      },
      detectRetina: true
    });
  },

  // 粒子爆发效果 - 用于招募令发布
  async createBurst(x, y, container) {
    const burstCount = 30;
    for (let i = 0; i < burstCount; i++) {
      const particle = document.createElement('div');
      const angle = (Math.PI * 2 * i) / burstCount;
      const distance = 200 + Math.random() * 300;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const size = 3 + Math.random() * 5;
      const colors = ['#fdcb6e', '#a29bfe', '#6c5ce7', '#fff', '#00b894'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        box-shadow: 0 0 ${size * 2}px ${color};
        --tx: ${tx}px;
        --ty: ${ty}px;
        animation: particleBurst ${1 + Math.random() * 1}s ease-out forwards;
      `;
      container.appendChild(particle);

      setTimeout(() => particle.remove(), 2500);
    }
  }
};
