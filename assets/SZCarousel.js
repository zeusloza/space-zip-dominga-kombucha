class SZCarousel extends HTMLElement {
  #currentIndex = 0;

  static get styles() {
    return /*css*/ `
        :host {
          display: block;
          position: relative;
          overflow: hidden;
        }

        .slides {
          width: 100%;
          display: flex;
        }

        ::slotted(carousel-item) {
          flex: 0 0 100%;
          transition: transform 0.5s ease;
        }
      `;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.elements();
    this.render();
    this.elements();
    this.events();
  }

  elements() {
    this.items = this.querySelectorAll('carousel-item');
    this.indicator = this.querySelector('#indicator');
    this.btnPrev = this.querySelector('#prev');
    this.btnNext = this.querySelector('#next');
  }

  events() {
    this.btnPrev.addEventListener('click', this.prevItem);
    this.btnNext.addEventListener('click', this.nextItem);
  }

  render() {
    this.shadowRoot.innerHTML = /*html*/ `
        <style>${SZCarousel.styles}</style>
        <slot name="before"></slot>
        <div part="slides" class="slides">
          <slot></slot>
        </div>
        <slot name="after"></slot>
      `;
  }

  update() {
    this.showItem(this.#currentIndex);
    this.dispatchEvent(
      new CustomEvent('indexChanged', {
        detail: {
          currentIndex: this.#currentIndex,
        },
      })
    );
  }

  showItem = (index) => {
    const offset = -index * 100;
    this.items.forEach((item) => {
      item.style.transform = `translateX(${offset}%)`;
    });
  };

  prevItem = () => {
    this.#currentIndex = (this.#currentIndex - 1 + this.items.length) % this.items.length;
    this.update();
  };

  nextItem = () => {
    this.#currentIndex = (this.#currentIndex + 1) % this.items.length;
    this.update();
  };

  get getItems() {
    return this.items;
  }

  get getCurrentIndex() {
    return this.#currentIndex;
  }
}
customElements.define('sz-carousel', SZCarousel);

customElements.define(
  'carousel-item',
  class CarouselItem extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.shadowRoot.innerHTML = /*html*/ `
        <slot></slot>
      `;
    }
  }
);

customElements.define(
  'carousel-controls',
  class CarouselControls extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      this.elements();
      this.render();
      this.events();
    }

    elements() {
      this.carousel = this.closest('sz-carousel');
      this.items = this.carousel.getItems;
    }

    events() {}

    render() {
      this.shadowRoot.innerHTML = `
      ${this.items && this.items.length >= 2 ? `<slot></slot>` : ''}
      `;
    }
  }
);

class CarouselIndicators extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.elements();
    this.render();
    this.events();
  }

  events() {
    const carousel = this.closest('sz-carousel');
    carousel.addEventListener('indexChanged', (event) => {
      this.update(event.detail.currentIndex, carousel.getItems.length);
    });
  }

  elements() {
    const carousel = this.closest('sz-carousel');
    this.items = carousel.getItems;
    this.currentItem = carousel.getCurrentIndex;
  }

  render() {
    this.shadowRoot.innerHTML = /*html*/ `
        <span id="indicator" aria-label="1 of 1">${this.currentItem + 1}/${this.items.length}</span>
      `;
  }

  update(currentIndex, totalItems) {
    const indicator = this.shadowRoot.querySelector('#indicator');
    indicator.textContent = `${currentIndex + 1}/${totalItems}`;
  }
}

customElements.define('carousel-indicators', CarouselIndicators);
