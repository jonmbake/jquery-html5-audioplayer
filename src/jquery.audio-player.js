/*
 * audio-player
 * https://github.com/jonmbake/jquery-html5-audioplayer
 *
 * Copyright (c) 2016 Jon Bake
 * Licensed under the MIT license.
 */

/**
 * To do: 
 * 1. Add tests
 * 3. Disable buttons when audio not loaded
 */
/* global define, URL */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else {
    factory(root.jQuery);
  }
}(this, function($) {
  /**
   * Default initialization options.
   * Other valid options are:
   *   menuHotkeyUrl - the url to GET and PUT hotkeys to
   * @type {Object}
   */
  var defaultOptions = {
    skipAmountSeconds: 15,
    audioSrcUrl: 'http://traffic.libsyn.com/timferriss/Tim_Ferriss_Show_-_Mike_Rowe.mp3',
    shortcuts: {
      playPause: 'Alt+P',
      rewind: 'Alt+B',
      fastforward: 'Alt+F',
      speedUp: 'Alt+U',
      slowDown: 'Alt+D'
    }
  };

  var AudioPlayer = function ($el, options) {
    this.$el = $el;
    $.extend(this, defaultOptions, options);
    this.audioLoaded = false;
    this._initHtml();
    this._initEvents();
    this._initShortcuts();
  };

  $.extend(AudioPlayer.prototype, {
    pause: function () {
      if (!this.audioLoaded) {
        return;
      }
      this.audioSrc.pause();
      this.$playPause.removeClass("fa-pause").addClass("fa-play");
    },
    play: function () {
      if (!this.audioLoaded) {
        return;
      }
      this.audioSrc.play();
      this.$playPause.removeClass("fa-play").addClass("fa-pause");
    },
    togglePlay: function () {
      if (this.audioSrc.paused) {
        this.play();
      } else { // pause music
        this.pause();
      }
    },
    rewind: function () {
      if (!this.audioLoaded) {
        return;
      }
      if (this.audioSrc.currentTime > this.skipAmountSeconds) {
        this.audioSrc.currentTime -= this.skipAmountSeconds;
      } else {
        this.audioSrc.currentTime = 0.0;
      }
    },
    fastforward: function () {
      if (!this.audioLoaded) {
        return;
      }
      if (this.audioSrc.duration - this.audioSrc.currentTime > this.skipAmountSeconds) {
        this.audioSrc.currentTime += this.skipAmountSeconds;
      } else {
        this.audioSrc.currentTime = this.audioSrc.duration;
      }
    },
    slowDown: function () {
      if (this.audioSrc.playbackRate.toFixed(1) > 0.5) {
        this.audioSrc.playbackRate -= 0.1;
        this.$currSpeed.text(this.audioSrc.playbackRate.toFixed(1));
      }
    },
    speedUp: function () {
      if (this.audioSrc.playbackRate.toFixed(1) < 2.0) {
        this.audioSrc.playbackRate += 0.1;
        this.$currSpeed.text(this.audioSrc.playbackRate.toFixed(1));
      }
    },
    loadAudioSource: function (url) {
      this.audioSrc.src = url;
    },
    _initHtml: function () {
      /*jshint multistr: true */
      var AUDIO_PLAYER_HTML = '<audio></audio>\
        <div class="player-wrapper">\
          <div class="player">\
            <div class="timeComponents">\
              <span class="timeline">\
                <span class="playhead"></span>\
              </span>\
              <span class="clock reading">00:00:00</span>\
            </div>\
            <div class="controls">\
              <span class="btnControls">\
              <a class="playPause btn fa-play"></a>\
              <a class="rewind btn fa-fast-backward"></a>\
              <a class="fastforward btn fa-fast-forward"></a>\
              <a class="slowDown btn fa-caret-square-o-down"></a>\
              <a class="speedUp btn fa-caret-square-o-up"></a>\
              </span>\
              <span class="reading">Speed: <span class="currSpeed">1.0</span>X</span>\
            </div>\
          </div>\
          <input type="file" name="audioFileInput" class="audioFileInput" accept="audio/*" />\
        </div>';
      // append the html
      this.$el.html(AUDIO_PLAYER_HTML);
      // keep a reference to the 
      this.$audioSrc = this.$el.find('audio');
      this.audioSrc = this.$audioSrc[0];
      this.$fileInput = this.$el.find('input[type="file"]');
      this.$timeline = this.$el.find('.timeline');
      this.$playhead = this.$el.find('.playhead');
      this.$clock = this.$el.find('.clock');
      this.$currSpeed = this.$el.find('.currSpeed');
      //controls
      this.$playPause  = this.$el.find('.playPause');
      this.$rewind = this.$el.find('.rewind');
      this.$fastforward = this.$el.find('.fastforward');
      this.$speedUp  = this.$el.find('.speedUp');
      this.$slowDown  = this.$el.find('.slowDown');
      if (this.audioSrcUrl) {
        this.loadAudioSource(this.audioSrcUrl);
        this.$fileInput.hide();
      }
    },
    _initEvents: function () {
      var as = this.audioSrc;
      //reset the Pause Btn to Play
      this.$audioSrc.on("ended", this.pause.bind(this)); 
      this.$audioSrc.on("timeupdate", this._syncTime.bind(this));
      this.$audioSrc.on("loadeddata", function () {
        this.audioLoaded = true;
        this.play();
      }.bind(this));

      // button events
      this.$playPause.on("click", this.togglePlay.bind(this));
      this.$rewind.on("click", this.rewind.bind(this));
      this.$fastforward.on("click", this.fastforward.bind(this));
      this.$slowDown.on("click", this.slowDown.bind(this));
      this.$speedUp.on("click", this.speedUp.bind(this));

      this.$timeline.on("click", function (e) {
        var percent = (e.pageX - this.$timeline.offset().left) / this.$timeline.outerWidth();
        as.currentTime = as.duration * percent;
        this._syncTime();
      }.bind(this));
      var _this = this;
      this.$fileInput.on('change', function(){
        var files = this.files;
        var fileUrl = URL.createObjectURL(files[0]);
        _this.loadAudioSource(fileUrl);
      });
    },
    _initShortcuts: function () {
      var shortcuts = this.shortcuts;
      this.$el.find('.btnControls').children().each(function () {
        var $btn = $(this);
        var c = $btn.attr('class').split(' ')[0];
        var sc = shortcuts[c];
        if (sc) {
          var $s = $('<sub/>').text(sc);
          $(this).append($s);
          $(document).bind('keydown', sc, function () {
            $btn[0].click();
          });
        }
      });
    },
    _syncTime: function () {
      var SECS_IN_MIN = 60;
      var SECS_IN_HOUR = 3600;
      var formatTime = function (timeInSeconds) {
        timeInSeconds = Math.round(timeInSeconds);
        var hours   = Math.floor(timeInSeconds / SECS_IN_HOUR);
        var hourSecs = hours * SECS_IN_HOUR;
        var minutes = Math.floor((timeInSeconds - hourSecs) / 60);
        var minuteSecs = minutes * SECS_IN_MIN;
        var seconds = timeInSeconds - hourSecs - minuteSecs;

        var result = (hours < 10 ? "0" + hours : hours);
        result += ":" + (minutes < 10 ? "0" + minutes : minutes);
        result += ":" + (seconds  < 10 ? "0" + seconds : seconds);
        return result;
      };
      var playPercent = (this.$timeline.outerWidth() - this.$playhead.outerWidth()) * (this.audioSrc.currentTime / this.audioSrc.duration);
      this.$clock.text(formatTime(this.audioSrc.currentTime));
      this.$playhead.css('marginLeft', playPercent + 'px');
    }
  });

  /**
   * Returns audio player data for element.
   *
   * @return {AudioPlayer} audio player obj.
   */
  var getData = function ($el) {
    var ap = $el.data('audioPlayer');
    if (!ap) {
      throw new Error('Element is currently not an audio player.');
    }
    return ap;
  };

  /**
   * Public API.
   *
   * @type {Object} api
   */
  var api = {
    /**
     * Inititialize this audio player element and attach as data to element.
     *
     * @param  {Object} options {@see defaultOptions}
     * @return {jQuery Element}         jquery element to allow chaining
     */
    init: function (options) {
      var ap = new AudioPlayer(this, options);
      this.data('audioPlayer', ap);
      return this;
    },
    playPause: function () {
      return getData(this).playPause();
    }
  };

   //Register this plugin.
  $.fn.audioPlayer = function(firstArg) {
    var pluginArgs = arguments;
    var isApiCall = typeof firstArg === 'string';
    var r = this.map(function () {
      if (firstArg === void 0 || typeof firstArg === 'object') { //calling the constructor
        return api.init.call($(this), firstArg);
      } else if (isApiCall && api[firstArg]) { //calling an API method
        return api[firstArg].apply($(this), Array.prototype.slice.call(pluginArgs, 1));
      } else { //calling a method that is not part of the API -- throw an error
        throw new Error("Calling method that is not part of the API");
      }
    });
    //if API call, "un-jquery" the return value 
    if (isApiCall) {
      //if a "get" call just return a single element
      if (firstArg.indexOf('get') === 0) {
        return r[0];
      }
      return r.toArray();
    }
    return r;
  };

  /*
   * Everything after here is **jQuery Hotkeys Plugin** source.
   * Copyright 2010, John Resig
   */
  jQuery.hotkeys = {
    version: "0.8",

    specialKeys: {
      8: "backspace",
      9: "tab",
      10: "return",
      13: "return",
      16: "shift",
      17: "ctrl",
      18: "alt",
      19: "pause",
      20: "capslock",
      27: "esc",
      32: "space",
      33: "pageup",
      34: "pagedown",
      35: "end",
      36: "home",
      37: "left",
      38: "up",
      39: "right",
      40: "down",
      45: "insert",
      46: "del",
      59: ";",
      61: "=",
      96: "0",
      97: "1",
      98: "2",
      99: "3",
      100: "4",
      101: "5",
      102: "6",
      103: "7",
      104: "8",
      105: "9",
      106: "*",
      107: "+",
      109: "-",
      110: ".",
      111: "/",
      112: "f1",
      113: "f2",
      114: "f3",
      115: "f4",
      116: "f5",
      117: "f6",
      118: "f7",
      119: "f8",
      120: "f9",
      121: "f10",
      122: "f11",
      123: "f12",
      144: "numlock",
      145: "scroll",
      173: "-",
      186: ";",
      187: "=",
      188: ",",
      189: "-",
      190: ".",
      191: "/",
      192: "`",
      219: "[",
      220: "\\",
      221: "]",
      222: "'"
    },

    shiftNums: {
      "`": "~",
      "1": "!",
      "2": "@",
      "3": "#",
      "4": "$",
      "5": "%",
      "6": "^",
      "7": "&",
      "8": "*",
      "9": "(",
      "0": ")",
      "-": "_",
      "=": "+",
      ";": ": ",
      "'": "\"",
      ",": "<",
      ".": ">",
      "/": "?",
      "\\": "|"
    },

    // excludes: button, checkbox, file, hidden, image, password, radio, reset, search, submit, url
    textAcceptingInputTypes: [
      "text", "password", "number", "email", "url", "range", "date", "month", "week", "time", "datetime",
      "datetime-local", "search", "color", "tel"],

    // default input types not to bind to unless bound directly
    textInputTypes: /textarea|input|select/i,

    options: {
      filterInputAcceptingElements: false,
      filterTextInputs: false,
      filterContentEditable: false
    }
  };

  function keyHandler(handleObj) {
    if (typeof handleObj.data === "string") {
      handleObj.data = {
        keys: handleObj.data
      };
    }

    // Only care when a possible input has been specified
    if (!handleObj.data || !handleObj.data.keys || typeof handleObj.data.keys !== "string") {
      return;
    }

    var origHandler = handleObj.handler,
      keys = handleObj.data.keys.toLowerCase().split(" ");

    handleObj.handler = function(event) {
      //      Don't fire in text-accepting inputs that we didn't directly bind to
      if (this !== event.target &&
        (jQuery.hotkeys.options.filterInputAcceptingElements &&
          jQuery.hotkeys.textInputTypes.test(event.target.nodeName) ||
          (jQuery.hotkeys.options.filterContentEditable && jQuery(event.target).attr('contenteditable')) ||
          (jQuery.hotkeys.options.filterTextInputs &&
            jQuery.inArray(event.target.type, jQuery.hotkeys.textAcceptingInputTypes) > -1))) {
        return;
      }

      var special = event.type !== "keypress" && jQuery.hotkeys.specialKeys[event.which],
        character = String.fromCharCode(event.which).toLowerCase(),
        modif = "",
        possible = {};

      jQuery.each(["alt", "ctrl", "shift"], function(index, specialKey) {

        if (event[specialKey + 'Key'] && special !== specialKey) {
          modif += specialKey + '+';
        }
      });

      // metaKey is triggered off ctrlKey erronously
      if (event.metaKey && !event.ctrlKey && special !== "meta") {
        modif += "meta+";
      }

      if (event.metaKey && special !== "meta" && modif.indexOf("alt+ctrl+shift+") > -1) {
        modif = modif.replace("alt+ctrl+shift+", "hyper+");
      }

      if (special) {
        possible[modif + special] = true;
      }
      else {
        possible[modif + character] = true;
        possible[modif + jQuery.hotkeys.shiftNums[character]] = true;

        // "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
        if (modif === "shift+") {
          possible[jQuery.hotkeys.shiftNums[character]] = true;
        }
      }

      for (var i = 0, l = keys.length; i < l; i++) {
        if (possible[keys[i]]) {
          return origHandler.apply(this, arguments);
        }
      }
    };
  }

  jQuery.each(["keydown", "keyup", "keypress"], function() {
    jQuery.event.special[this] = {
      add: keyHandler
    };
  });
}));
