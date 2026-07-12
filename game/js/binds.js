// ============================================================================
// binds.js — remappable keybinds (2026-07-12). Bindings are stored in
// SAVE.settings().binds as `event.code` strings (layout-independent, e.g.
// 'KeyP','Space','Escape'). The dispatcher reads them LIVE on every keypress,
// so a rebind takes effect instantly with zero listener re-registration — and
// on-screen labels just re-read BINDS.keyLabel(id). Presentation/input only.
// ============================================================================
var BINDS = (function () {

  function binds() { return SAVE.settings().binds; }
  function slotOf(id, slot) { var b = binds()[id]; return b ? b[slot] : null; }

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

  // On-screen label for an action's PRIMARY key (the chips beside stations, the
  // HUD, the footer all use this). altLabel() is the alternate; '—' when unset.
  function keyLabel(id) { return friendly(slotOf(id, 'primary')); }
  function altLabel(id) { return friendly(slotOf(id, 'alt')); }

  // The action (if any) bound to a keydown event — matches EITHER slot.
  function actionForEvent(ev) {
    var b = binds();
    for (var id in b) {
      if (b[id] && (b[id].primary === ev.code || b[id].alt === ev.code)) return id;
    }
    return null;
  }

  // Rebind one SLOT ('primary'|'alt') of an action. De-dupes: the same code is
  // cleared from any other (action, slot) it occupied, so no two bindings ever
  // silently share a key (the displaced slot becomes null / unbound).
  function rebind(id, slot, code) {
    var b = binds();
    for (var other in b) {
      if (!b[other]) continue;
      if ((other !== id || 'primary' !== slot) && b[other].primary === code) b[other].primary = null;
      if ((other !== id || 'alt' !== slot)     && b[other].alt === code)     b[other].alt = null;
    }
    if (b[id]) b[id][slot] = code;
    SAVE.saveSettings();
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

  // event.code for a given action + slot (null if unbound) — for the rig's
  // polled movement / interact keys.
  function code(id, slot) { return slotOf(id, slot); }

  return {
    friendly: friendly, keyLabel: keyLabel, altLabel: altLabel,
    actionForEvent: actionForEvent, rebind: rebind, code: code,
    phaserKeyCode: phaserKeyCode, wire: wire
  };
})();
if (typeof module !== 'undefined') { module.exports = BINDS; }
