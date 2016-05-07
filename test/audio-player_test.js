(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  module('jQuery#audio_player', {
    // This will run before each test in this module.
    setup: function() {
      this.ap = $('#audio-player');
      this.ap.audioPlayer();
    }
  });

  QUnit.test('plugin was initialized', function() {
    expect(1);
    // Not a bad test to run on collection methods.
    ok(this.ap.data('audioPlayer'), "Audio player data is attached to DOM node.");
  });

}(jQuery));
