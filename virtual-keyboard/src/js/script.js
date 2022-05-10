// eslint-disable-next-line import/extensions
import { keyboardFragment, keyboardKeys } from './keyboardLayout.js';

class Keyboard {
  constructor() {
    this.caps = false;
    this.lang = localStorage.getItem('lang') === 'ru' ? 'ru' : 'en';
  }

  init() {
    this.textarea = document.createElement('textarea');
    this.keyboard = document.createElement('div');
    const wrapper = document.createElement('main');
    const keyboardRow = document.createElement('div');
    const language = document.createElement('p');

    wrapper.classList.add('wrapper');

    this.textarea.autofocus = true;
    this.textarea.classList.add('text');

    this.keyboard.classList.add('keyboard');
    keyboardRow.classList.add('keyboard__row');

    language.classList.add('info');
    language.textContent = 'Use Ctrl+Alt to switch language.';

    this.keyboard.appendChild(keyboardFragment);
    this.showLanguage(this.lang);

    wrapper.appendChild(this.textarea);
    wrapper.appendChild(this.keyboard);
    wrapper.appendChild(language);

    document.body.appendChild(wrapper);

    this.createListeners();
  }

  createListeners() {
    this.textarea.addEventListener('blur', () => {
      setTimeout(() => {
        this.textarea.focus();
      }, 0);
    });

    document.addEventListener('keydown', (e) => {
      e.stopImmediatePropagation();

      const key = document.getElementById(e.code);
      if (!key) {
        e.preventDefault();
        return;
      }

      if (e.code === 'CapsLock' && !e.repeat) {
        e.preventDefault();
        this.caps = !this.caps;

        const addRemove = this.caps ? 'add' : 'remove';
        key.classList[addRemove]('active');

        this.switchCaps(e.shiftKey);
      } else {
        key.classList.add('active');

        if ((e.ctrlKey || e.metaKey) && e.altKey && !e.repeat) {
          e.preventDefault();
          this.lang = this.lang === 'ru' ? 'en' : 'ru';
          localStorage.setItem('lang', this.lang);
          this.showLanguage(this.lang, e.shiftKey);
        } else if (e.code === 'AltLeft' || e.code === 'AltRight') {
          e.preventDefault();
        } else if (!keyboardKeys[e.code].func) {
          e.preventDefault();
          this.insertText(key.textContent);
        } else if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) {
          e.preventDefault();
          this.switchCaps(e.shiftKey);
        } else if (e.code === 'Tab') {
          e.preventDefault();
          this.insertText('    ');
        } else if (e.code === 'Enter') {
          e.preventDefault();
          this.insertText('\n');
        } else if (e.code === 'Backspace') {
          e.preventDefault();
          this.pressBackspace();
        } else if (e.code === 'Delete') {
          e.preventDefault();
          this.pressDelete();
        } else if (e.code === 'ArrowUp' && !e.isTrusted) {
          this.arrowUp();
        } else if (e.code === 'ArrowDown' && !e.isTrusted) {
          this.arrowDown();
        } else if (e.code === 'ArrowLeft' && !e.isTrusted) {
          this.arrowLeft();
        } else if (e.code === 'ArrowRight' && !e.isTrusted) {
          this.arrowRight();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      e.stopImmediatePropagation();

      const key = document.getElementById(e.code);
      if (!key) {
        e.preventDefault();
        return;
      }

      if (e.code !== 'CapsLock') {
        key.classList.remove('active');
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
          e.preventDefault();
          this.switchCaps(e.shiftKey);
        }
      }
    });

    this.keyboard.addEventListener('mousedown', (e) => {
      this.textarea.focus();
      const eventKeyDown = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        code: e.target.id,
        shiftKey: (e.target.id === 'ShiftLeft' || e.target.id === 'ShiftRight'),
        view: window,
      });
      document.dispatchEvent(eventKeyDown);
    });

    this.keyboard.addEventListener('mouseup', (e) => {
      this.textarea.focus();
      const eventKeyUp = new KeyboardEvent('keyup', {
        bubbles: true,
        cancelable: true,
        code: e.target.id,
        shiftKey: !(e.target.id === 'ShiftLeft' || e.target.id === 'ShiftRight'),
        view: window,
      });
      document.dispatchEvent(eventKeyUp);
    });
  }

  arrowUp() {
    this.textarea.selectionStart = 0;
    this.textarea.selectionEnd = this.textarea.selectionStart;
  }

  arrowDown() {
    this.textarea.selectionEnd = this.textarea.textLength;
    this.textarea.selectionStart = this.textarea.selectionEnd;
  }

  arrowLeft() {
    this.textarea.selectionStart = Math.max(0, this.textarea.selectionStart - 1);
    this.textarea.selectionEnd = this.textarea.selectionStart;
  }

  arrowRight() {
    this.textarea.selectionStart = Math.min(
      this.textarea.textLength,
      this.textarea.selectionEnd + 1,
    );
    this.textarea.selectionEnd = this.textarea.selectionStart;
  }

  insertText(chars) {
    const cursorAt = this.textarea.selectionStart;

    this.textarea.value = this.textarea.value.slice(0, cursorAt)
      + chars
      + this.textarea.value.slice(this.textarea.selectionEnd);

    this.textarea.selectionStart = cursorAt + chars.length;
    this.textarea.selectionEnd = this.textarea.selectionStart;
  }

  pressBackspace() {
    if (this.textarea.selectionStart !== this.textarea.selectionEnd) {
      this.insertText('');
    } else {
      const cursorAt = Math.max(0, this.textarea.selectionStart - 1);

      this.textarea.value = this.textarea.value.slice(0, cursorAt)
      + this.textarea.value.slice(this.textarea.selectionEnd);

      this.textarea.selectionStart = cursorAt;
      this.textarea.selectionEnd = this.textarea.selectionStart;
    }
  }

  pressDelete() {
    if (this.textarea.selectionStart !== this.textarea.selectionEnd) {
      this.insertText('');
    } else {
      const cursorAt = this.textarea.selectionStart;

      this.textarea.value = this.textarea.value.slice(0, cursorAt)
      + this.textarea.value.slice(cursorAt + 1);

      this.textarea.selectionStart = cursorAt;
      this.textarea.selectionEnd = this.textarea.selectionStart;
    }
  }

  showLanguage(lang, shift = false) {
    Array.from(this.keyboard.querySelectorAll('.keyboard__key')).forEach(
      (e) => {
        e.textContent = keyboardKeys[e.id][lang];
      },
    );

    this.switchCaps(shift);
  }

  switchCaps(shiftKey) {
    const showUpperCase = (this.caps && !shiftKey) || (!this.caps && shiftKey);
    const toCase = showUpperCase ? 'toUpperCase' : 'toLowerCase';
    Array.from(this.keyboard.querySelectorAll('.keyboard__key')).forEach(
      (e) => {
        if (!keyboardKeys[e.id].func) {
          if (e.id === 'Digit1') {
            e.textContent = shiftKey ? '!' : '1';
          } else if (e.id === 'Digit2') {
            e.textContent = shiftKey ? '@' : '2';
          } else if (e.id === 'Digit3') {
            e.textContent = shiftKey ? '#' : '3';
          } else if (e.id === 'Digit4') {
            e.textContent = shiftKey ? '$' : '4';
          } else if (e.id === 'Digit5') {
            e.textContent = shiftKey ? '%' : '5';
          } else if (e.id === 'Digit6') {
            e.textContent = shiftKey ? '^' : '6';
          } else if (e.id === 'Digit7') {
            e.textContent = shiftKey ? '&' : '7';
          } else if (e.id === 'Digit8') {
            e.textContent = shiftKey ? '*' : '8';
          } else if (e.id === 'Digit9') {
            e.textContent = shiftKey ? '(' : '9';
          } else if (e.id === 'Digit0') {
            e.textContent = shiftKey ? ')' : '0';
          } else if (e.id === 'Minus') {
            e.textContent = shiftKey ? '_' : '-';
          } else if (e.id === 'Equal') {
            e.textContent = shiftKey ? '+' : '=';
          } else if (e.id === 'Backslash') {
            e.textContent = shiftKey ? '|' : '\\';
          } else if (e.id === 'Backquote' && this.lang === 'en') {
            e.textContent = shiftKey ? '~' : '`';
          } else if (e.id === 'BracketLeft' && this.lang === 'en') {
            e.textContent = shiftKey ? '{' : '[';
          } else if (e.id === 'BracketRight' && this.lang === 'en') {
            e.textContent = shiftKey ? '}' : ']';
          } else if (e.id === 'Semicolon' && this.lang === 'en') {
            e.textContent = shiftKey ? ':' : ';';
          } else if (e.id === 'Quote' && this.lang === 'en') {
            e.textContent = shiftKey ? '"' : "'";
          } else if (e.id === 'Comma' && this.lang === 'en') {
            e.textContent = shiftKey ? '<' : ',';
          } else if (e.id === 'Period' && this.lang === 'en') {
            e.textContent = shiftKey ? '>' : '.';
          } else if (e.id === 'Slash' && this.lang === 'en') {
            e.textContent = shiftKey ? '?' : '/';
          } else if (e.id === 'Slash' && this.lang === 'ru') {
            e.textContent = shiftKey ? ',' : '.';
          } else {
            e.textContent = e.textContent[toCase]();
          }
        }
      },
    );
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const keyboard = new Keyboard();
  keyboard.init();
});

// eslint-disable-next-line no-alert
alert('Привет, я забыл ссылку на pull request. Можешь не искать, вот она: https://github.com/Stesho/keyboard/pull/2 Спасибо, за понимание, и удачи в учебе)');
