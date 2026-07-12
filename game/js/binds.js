// ============================================================================
// binds.js — remappable keybinds (2026-07-12). Bindings are stored in
// SAVE.settings().binds as `event.code` strings (layout-independent, e.g.
// 'KeyP','Space','Escape'). The dispatcher reads them LIVE on every keypress,
// so a rebind takes effect instantly with zero listener re-registration — and
// on-screen labels just re-read BINDS.keyLabel(id). Presentation/input only.
// ============================================================================
var BINDS = (function () {

  function binds() { return SAVE.settings().binds; }

  // event.code -> a short, human key label for on-screen use.
  function friendly(code) {
    if (!code) return '—';
    if (code === 'Space')  return 'SPACE';
    if (code === 'Escape') return 'ESC';
    var m;
    if ((m = /^Key([A-Z])$/.exec(code)))    return m[1];
    if ((m = /^Digit(\d)$/.exec(code)))     return m[1];
    if ((m = /^Numpad(\d)$/.exec(code)))    return 'Num' + m[1];
    var special = {
      ArrowLeft: '◄', ArrowRight: '►', ArrowUp: '▲', ArrowDown: '▼',
      Enter: 'ENTER', Tab: 'TAB', Backspace: '⌫',
      ShiftLeft: 'LShift', ShiftRight: 'RShift', ControlLeft: 'LCtrl',
      ControlRight: 'RCtrl', AltLeft: 'LAlt', AltRight: 'RAlt',
      Minus: '-', Equal: '=', Comma: ',', Period: '.', Slash: '/',
      Semicolon: ';', Quote: "'", BracketLeft: '[', BracketRight: ']',
      Backslash: '\\', Backquote: '`'
    };
    return special[code] || code;
  }

  // Current key label for an action id (what the on-screen chips render).
  function keyLabel(id) { return friendly(binds()[id]); }

  // The action (if any) bound to a keydown event.
  function actionForEvent(ev) {
    var b = binds();
    for (var id in b) if (b[id] === ev.code) return id;
    return null;
  }

  // Rebind with SWAP: if another action already holds `code`, it inherits the
  // key `id` was using — so two actions never silently share a key and none
  // is left blank. Returns the (possibly) displaced action id, else null.
  function rebind(id, code) {
    var b = binds();
    var prev = b[id], displaced = null;
    for (var other in b) {
      if (other !== id && b[other] === code) { b[other] = prev; displaced = other; }
    }
    b[id] = code;
    SAVE.saveSettings();
    return displaced;
  }

  // event.code -> Phaser KeyCode number, for addKey() (movement + ability keys,
  // which are polled continuously rather than dispatched). null = can't map.
  function phaserKeyCode(code) {
    if (typeof Phaser === 'undefined' || !code) return null;
    var KC = Phaser.Input.Keyboard.KeyCodes, m;
    if ((m = /^Key([A-Z])$/.exec(code))) return KC[m[1]];
    if ((m = /^Digit(\d)$/.exec(code))) {
      var d = ['ZERO','ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE'];
      return KC[d[+m[1]]];
    }
    var map = {
      Space: KC.SPACE, Escape: KC.ESC, Enter: KC.ENTER, Tab: KC.TAB,
      ArrowLeft: KC.LEFT, ArrowRight: KC.RIGHT, ArrowUp: KC.UP, ArrowDown: KC.DOWN,
      ShiftLeft: KC.SHIFT, ShiftRight: KC.SHIFT, ControlLeft: KC.CTRL, ControlRight: KC.CTRL,
      AltLeft: KC.ALT, AltRight: KC.ALT, Comma: KC.COMMA, Period: KC.PERIOD
    };
    return map[code] != null ? map[code] : null;
  }

  // Wire ONE keydown listener that dispatches discrete actions from the live
  // binds map. `actions` maps action id -> handler(ev). Movement ids are
  // deliberately absent from `actions` (the rig polls those), so their
  // keydowns simply no-op here. Capture mode (rebinding) suppresses dispatch.
  function wire(scene, actions) {
    scene.input.keyboard.on('keydown', function (ev) {
      if (scene._bindsCapture) return;
      var id = actionForEvent(ev);
      if (id && actions[id]) actions[id](ev);
    });
  }

  return {
    friendly: friendly, keyLabel: keyLabel, actionForEvent: actionForEvent,
    rebind: rebind, phaserKeyCode: phaserKeyCode, wire: wire
  };
})();
if (typeof module !== 'undefined') { module.exports = BINDS; }
