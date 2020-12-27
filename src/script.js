/*
 * A thin wrapper around Javascripts Date object
 * Provides extra methods for better managing
 * the date.
 *
 * Javascript handles time in 24-hour format so we keep
 * to that but add some extra methods for exporting and
 * importing it to and from 12/hour format
*/
$(document).ready(function () {
    $(document).bind("contextmenu", function (e) {
        return false;
    });
});
var Time = /** @class */ (function () {
    // A date object can be provided if desired to give a preset time
    // otherwise a current date will be creted
    function Time(date) {
        if (date === void 0) { date = new Date(); }
        this.date = date;
    }
    // Import a time from 12 hour format to 24 hour format
    // If a current Time object is given it will be updated
    // with the new time otherwise a new Time object will be
    // created
    Time.from12 = function (time12, time24) {
        if (time24 === void 0) { time24 = new Time(); }
        var hours24 = time12.hours;
        var minutes = time12.minutes;
        if (!time12.pm && hours24 == 12) {
            hours24 = 0;
        }
        if (time12.pm && hours24 < 12) {
            hours24 = hours24 + 12;
        }
        time24.date.setHours(hours24);
        time24.date.setMinutes(minutes);
        return time24;
    };
    // Export a time to 12 hour format from 24 hour format
    Time.prototype.to12 = function (time12) {
        if (time12 === void 0) { time12 = { hours: 0, minutes: 0, pm: false }; }
        var hours24 = this.hours;
        var hours12 = ((hours24 + 11) % 12 + 1);
        var pm = hours24 > 11;
        var minutes = this.minutes;
        time12.hours = hours12;
        time12.minutes = minutes;
        time12.pm = pm;
        return time12;
    };
    Object.defineProperty(Time.prototype, "hours", {
        // Getters and setters for conv.
        // Upon hours or minutes changing, an event will be fired
        // the event object will contain the new and old value
        get: function () {
            return this.date.getHours();
        },
        set: function (hours) {
            if (hours === this.hours)
                return;
            $(this).trigger("hoursChange", [hours, this.hours]);
            this.date.setHours(hours);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Time.prototype, "minutes", {
        get: function () {
            return this.date.getMinutes();
        },
        set: function (minutes) {
            if (minutes === this.minutes)
                return;
            $(this).trigger("minutesChange", [minutes, this.minutes]);
            this.date.setMinutes(minutes);
        },
        enumerable: false,
        configurable: true
    });
    return Time;
}());
/*
 * Interfaces with a spinner
*/
var Spinner = /** @class */ (function () {
    // To what spinner group and spinner group entry does this interface belong
    // What should the spinner be set to automatically
    function Spinner(groupName, groupEntryId, notchId) {
        if (notchId === void 0) { notchId = 0; }
        this.groupName = groupName;
        this.groupEntryId = groupEntryId;
        this.notchId = notchId;
    }
    // Re-update the spinner based on the existing value stored here
    Spinner.prototype.refresh = function () {
        $("." + this.groupName
            + " .slot-" + this.groupEntryId
            + " .strip").removeClass(Spinner.notchesCSS);
        $("." + this.groupName
            + " .slot-" + this.groupEntryId
            + " .strip").addClass("pos-" + this.notchId);
    };
    Object.defineProperty(Spinner.prototype, "notchId", {
        get: function () {
            return this._notchId;
        },
        // Re-adjust the spinner to a new value
        set: function (value) {
            if (this.notchId == value)
                return;
            $(this).trigger("notchIdChange", [value, this._notchId]);
            this._notchId = value;
            this.refresh();
        },
        enumerable: false,
        configurable: true
    });
    // A spinner has 9 notches
    Spinner.notchesCSS = "pos-0 pos-1 pos-2 pos-3 pos-4 pos-5 pos-6 pos-7 pos-8 pos-9";
    return Spinner;
}());
/*
 * This interfaces to 2 spinners and treats them like 2-digit
 * numbers with an optionally clamped min and max range
*/
var SpinnerGroupDigits = /** @class */ (function () {
    function SpinnerGroupDigits(groupName, value, min, max, spinner1, spinner2) {
        if (value === void 0) { value = 0; }
        if (min === void 0) { min = undefined; }
        if (max === void 0) { max = undefined; }
        if (spinner1 === void 0) { spinner1 = new Spinner(groupName, 1); }
        if (spinner2 === void 0) { spinner2 = new Spinner(groupName, 2); }
        this.groupName = groupName;
        this.spinner1 = spinner1;
        this.spinner2 = spinner2;
        this.maxLimit = max;
        this.minLimit = min;
        this.value = value;
    }
    // Re-update both spinners to the existing value
    // Useful for when switching from another SpinnerGroupDigits
    SpinnerGroupDigits.prototype.refresh = function () {
        this.spinner1.refresh();
        this.spinner2.refresh();
    };
    // Re-update the spinners to the value stored here
    SpinnerGroupDigits.prototype.updateValue = function () {
        if (this.value < 10) {
            this.spinner1.notchId = 0;
            this.spinner2.notchId = this.value;
        }
        else {
            var tmp = this.value.toString();
            var digit1 = tmp[0];
            var digit2 = tmp[1];
            this.spinner1.notchId = parseInt(digit1);
            this.spinner2.notchId = parseInt(digit2);
        }
    };
    // Ensure the value stored here is within valid range if set
    SpinnerGroupDigits.prototype.validate = function () {
        if (this.maxLimit !== undefined && this.value > this.maxLimit)
            this._value = this.maxLimit;
        else if (this.minLimit !== undefined && this.value < this.minLimit)
            this._value = this.minLimit;
    };
    Object.defineProperty(SpinnerGroupDigits.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            if (this.value === value)
                return;
            $(this).trigger("valueChange", [value, this._value]);
            this._value = value;
            this.validate();
            this.updateValue();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SpinnerGroupDigits.prototype, "maxLimit", {
        get: function () {
            return this._maxLimit;
        },
        set: function (value) {
            $(this).trigger("maxLimitChange", [value, this._maxLimit]);
            this._maxLimit = value;
            this.validate();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SpinnerGroupDigits.prototype, "minLimit", {
        get: function () {
            return this._minLimit;
        },
        set: function (value) {
            $(this).trigger("minLimitChange", [value, this._minLimit]);
            this._minLimit = value;
            this.validate();
        },
        enumerable: false,
        configurable: true
    });
    return SpinnerGroupDigits;
}());
/*
 * A clock interfaces with the dials on the page
 * Multiple clocks can exist but they will all use the same dials
 * so its important to ensure only one clock is actively used
 * at a time if more than one exists
*/
var Clock = /** @class */ (function () {
    // Create
    function Clock() {
        this.isAlarm = false;
        this.isTimer = false;
        // Create proper interfaces to the dials
        this.hours = new SpinnerGroupDigits("hours", 1, 1, 12);
        this.minutes = new SpinnerGroupDigits("minutes", 1, 0, 59);
        this.amPm = new Spinner("am-pm", 1);
        // disable 24 hour mode by default
        this._hr24Mode = false;
        // Create a 24-hour clock backend
        this.time24 = new Time();
    }
    // Forces the dials to refresh themselves with the values stored in
    // cache, if the 24-hour clock backend has changed it wont be reflected
    // here as only old values are refreshed.
    // Useful when switching active clocks
    Clock.prototype.refresh = function () {
        this.hours.refresh();
        this.minutes.refresh();
        this.amPm.refresh();
    };
    // Update the 24-hour backend to represent the current time
    // and reflect those changes on the dials
    Clock.prototype.currentTime = function () {
        this.time24 = new Time();
        this.updateTime(false);
    };
    // Update the dials to whatever the current 24-hour backend has
    Clock.prototype.updateTime = function (saveTimer) {
        if (saveTimer === void 0) { saveTimer = true; }
        if (this.hr24Mode) {
            this.hours.value = this.time24.hours;
            this.minutes.value = this.time24.minutes;
            this.amPm.notchId = 2;
        }
        else {
            this.hours.value = this.time24.to12().hours;
            this.minutes.value = this.time24.to12().minutes;
            if (this.time24.to12().pm)
                this.amPm.notchId = 1;
            else
                this.amPm.notchId = 0;
        }
        if (this.isAlarm) {
            localStorage.setItem('mclock.alarm.hours', this.time24.hours.toString());
            localStorage.setItem('mclock.alarm.minutes', this.time24.minutes.toString());
            localStorage.setItem('mclock.alarm.pm', this.time24.to12().pm.toString());
        }
        else if (this.isTimer) {
            this.secondsToWait = (this.time24.hours * 3600) + (this.time24.minutes * 60);
            console.log(this.secondsToWait);
            if (saveTimer) {
                localStorage.setItem('mclock.timer.hours', this.time24.hours.toString());
                localStorage.setItem('mclock.timer.minutes', this.time24.minutes.toString());
            }
        }
    };
    Object.defineProperty(Clock.prototype, "hr24Mode", {
        // When changing 24-hour mode, the hours dial must be updated
        get: function () {
            return this._hr24Mode;
        },
        set: function (value) {
            this._hr24Mode = value;
            if (value) {
                this.hours = new SpinnerGroupDigits("hours", 0, 0, 23);
            }
            else {
                this.hours = new SpinnerGroupDigits("hours", 0, 1, 12);
            }
            this.updateTime(false);
        },
        enumerable: false,
        configurable: true
    });
    return Clock;
}());
var Main = /** @class */ (function () {
    function Main() {
        document.body.style.cursor = 'none';
        this.count = 0;
        var brightness = localStorage.getItem('mclock.brightness');
        if (!brightness) {
            brightness = '127';
        }
        var volume = localStorage.getItem('mclock.volume');
        if (!volume) {
            volume = '.1';
        }
        var color = localStorage.getItem('mclock.bgcolor');
        if (!color) {
            color = '#2e5090';
        }
        var audio = localStorage.getItem('mclock.audio');
        if (audio) {
            this.fileReader = new FileReader();
            this.fileReaderDone = true;
            $("#player")[0].src = audio;
            $("#player")[0].volume = .1;
            $(".alarm-melody").addClass("toggled");
        }
        // Create the clock
        this.clock = new Clock();
        // and the alarm clock, disabling alarm mode
        this.alarm = new Clock();
        this.alarm.isAlarm = true;
        // and the timer clock
        this.timer = new Clock();
        this.timer.isTimer = true;
        this.timer.hr24Mode = true;
        var hours = localStorage.getItem('mclock.alarm.hours');
        this.alarm.time24.hours = 0;
        this.alarm.time24.minutes = 0;
        this.alarm.time24.to12().pm = false;
        if (hours != null && hours != 'NaN') {
            this.alarm.time24.hours = parseInt(hours);
        }
        var minutes = localStorage.getItem('mclock.alarm.minutes');
        if (minutes != null && minutes != 'NaN') {
            this.alarm.time24.minutes = parseInt(minutes);
        }
        var pm = localStorage.getItem('mclock.alarm.pm');
        if (pm != null && pm != 'NaN') {
            this.alarm.time24.to12().pm = (pm == 'true');
        }
        var thours = localStorage.getItem('mclock.timer.hours');
        this.timer.time24.hours = 0;
        this.timer.time24.minutes = 0;
        this.timer.time24.to12().pm = false;
        if (thours != null && thours != 'NaN') {
            this.timer.time24.hours = parseInt(thours);
        }
        var tminutes = localStorage.getItem('mclock.timer.minutes');
        if (tminutes != null && tminutes != 'NaN') {
            this.timer.time24.minutes = parseInt(tminutes);
        }
        this.alarmMode = false;
        var hr24Mode = localStorage.getItem('mclock.hr24Mode') == 'true';
        if (hr24Mode != this.clock.hr24Mode) {
            this.toggle24hrMode();
        }
        // Enable Alarm features
        this.enableAlarmFeatures();
        // Wireup some event handlers
        $(".brightness").click(this.enableBrightness.bind(this));
        this.brightness = document.querySelector("#brightness");
        this.brightness.value = brightness;
        this.setBrightness(brightness);
        this.brightness.addEventListener("input", this.updateBrightness.bind(this), false);
        this.brightness.select();
        $(".volume").click(this.enableVolume.bind(this));
        this.volume = document.querySelector("#volume");
        this.volume.value = volume;
        this.setVolume(volume);
        this.volume.addEventListener("input", this.updateVolume.bind(this), false);
        this.volume.select();
        $(".alarm-set").click(this.toggleAlarmMode.bind(this));
        $(".timer-set").click(this.toggleTimerMode.bind(this));
        $(".alarm-24hr").click(this.toggle24hrMode.bind(this));
        $(".alarm-bgcolor").click(this.setAlarmColor.bind(this));
        this.bgcolor = document.querySelector("#alarm-bgcolor");
        this.bgcolor.value = color;
        $(document.body).css('background-color', color);
        this.bgcolor.addEventListener("input", this.updateColor, false);
        this.bgcolor.select();
        $(".hours .up").click(this.incrementAlarmHours.bind(this));
        $(".hours .down").click(this.decrementAlarmHours.bind(this));
        $(".minutes .up").click(this.incrementAlarmMinutes.bind(this));
        $(".minutes .down").click(this.decrementAlarmMinutes.bind(this));
        $(".am-pm .up").click(this.alarmToAm.bind(this));
        $(".am-pm .down").click(this.alarmToPm.bind(this));
        $(".alarm-melody").click(this.loadAlarmMelodyFile.bind(this));
        $("#alarmTone").change(this.isLoadedAlarmMelodyFile.bind(this));
        $(".alarm-melody-play").click(this.soundAlarm.bind(this));
        this.alarmEnabled = false;
        $(".alarm-enable").click(this.alarmEnable.bind(this));
        this.timerEnabled = false;
        $(".timer-enable").click(this.timerEnable.bind(this));
        this.alarmSleepActivated = false;
        this.countdownTimerActivated = false;
        this.sleepTimerActivated = false;
        $(".alarm-snooze").click(this.alarmSleep.bind(this));
        // Update clock to current time and begin ticking every second
        this.updateClock();
        setInterval(this.updateClock.bind(this), 1000);
    }
    Main.prototype.updateColor = function (ev) {
        var color = ev.target.value;
        $(document.body).css('background-color', color);
        localStorage.setItem('mclock.bgcolor', color);
    };
    Main.prototype.setBrightness = function (brightness) {
        localStorage.setItem('mclock.brightness', brightness);
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", 'http://127.0.0.1:5000/' + '?b=' + brightness, false);
        try {
            xmlHttp.send(null);
        }
        catch (_a) {
        }
    };
    Main.prototype.setVolume = function (volume) {
        localStorage.setItem('mclock.volume', volume);
        $("#player")[0].volume = volume;
    };
    Main.prototype.updateBrightness = function (ev) {
        var brightness = ev.target.value;
        this.setBrightness(brightness);
    };
    Main.prototype.updateVolume = function (ev) {
        var volume = ev.target.value;
        this.setVolume(volume);
    };
    // Gets called every second
    Main.prototype.updateClock = function () {
        if (++this.count > 2) {
            $('.strip').css('transition', 'all 1s linear');
        }
        if (!this.alarmMode && !this.timerMode) {
            this.clock.currentTime();
        }
        if (!this.alarmMode) {
            if (this.alarmEnabled && !this.alarmPlaying) {
                var alarmHours = this.alarm.time24.hours;
                var alarmMinutes = this.alarm.time24.minutes;
                var clockHours = this.clock.time24.hours;
                var clockMinutes = this.clock.time24.minutes;
                if (alarmHours == clockHours &&
                    alarmMinutes == clockMinutes)
                    this.soundAlarm();
            }
        }
        if (!this.timerMode) {
            if (this.timerEnabled) {
                var startTime = this.timer.startTime;
                var secondsToWait = this.timer.secondsToWait;
                var currentSeconds = Math.floor(this.clock.time24.date.getTime() / 1000);
                //console.log('startTime:', startTime);
                //console.log('secondsToWait:', secondsToWait);
                //console.log('currentSeconds:', currentSeconds);
                if (startTime + secondsToWait < currentSeconds) {
                    this.soundAlarm();
                    this.timerEnable();
                }
            }
        }
    };
    // Used when switching clocks between current clock and alarm clock
    Main.prototype.refreshClock = function () {
        if (this.alarmMode) {
            // Apply new values to all the sliders for this clock
            this.alarm.updateTime();
            // Re-apply old values since the dial positions are from a
            // previous clock and need changing to reflect this clock again
            this.alarm.refresh();
        }
        else if (this.timerMode) {
            // Apply new values to all the sliders for this clock
            this.timer.updateTime();
            // Re-apply old values since the dial positions are from a
            // previous clock and need changing to reflect this clock again
            this.timer.refresh();
        }
        else {
            this.updateClock();
            this.clock.refresh();
        }
    };
    Object.defineProperty(Main.prototype, "alarmMode", {
        get: function () {
            return this._alarmMode;
        },
        // Force a refresh on clock switch
        set: function (value) {
            this._alarmMode = value;
            this.refreshClock();
            if (value) {
                $(".alarm-set").addClass("toggled");
                $(".arrow").removeClass("hidden");
                $(".arrow").removeClass("hidden");
                if (this.alarm.hr24Mode) {
                    $(".am-pm .arrow").addClass("hidden");
                }
                if (this.alarm.hr24Mode)
                    $(".alarm-24hr").addClass("toggled");
                else
                    $(".alarm-24hr").removeClass("toggled");
            }
            else {
                $(".alarm-set").removeClass("toggled");
                $(".arrow").addClass("hidden");
                $(".arrow").addClass("hidden");
                if (this.clock.hr24Mode)
                    $(".alarm-24hr").addClass("toggled");
                else
                    $(".alarm-24hr").removeClass("toggled");
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Main.prototype, "timerMode", {
        get: function () {
            return this._timerMode;
        },
        set: function (value) {
            this._timerMode = value;
            this.refreshClock();
            if (value) {
                $(".timer-set").addClass("toggled");
                $(".arrow").removeClass("hidden");
                $(".arrow").removeClass("hidden");
                $(".am-pm").addClass("hidden");
                $(".am-pm .arrow").addClass("hidden");
            }
            else {
                $(".timer-set").removeClass("toggled");
                $(".arrow").addClass("hidden");
                $(".arrow").addClass("hidden");
                $(".am-pm").removeClass("hidden");
                $(".am-pm .arrow").addClass("hidden");
                if (this.clock.hr24Mode) {
                    $(".alarm-24hr").addClass("toggled");
                }
                else {
                    $(".alarm-24hr").removeClass("toggled");
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Main.prototype.toggleAlarmMode = function () {
        this.alarmMode = !this.alarmMode;
    };
    Main.prototype.toggleTimerMode = function () {
        this.timerMode = !this.timerMode;
    };
    Main.prototype.enableBrightness = function () {
        if (this.brightness.style.display == 'none') {
            this.brightness.style.display = 'inline';
        }
        else {
            this.brightness.style.display = 'none';
        }
        ;
    };
    Main.prototype.enableVolume = function () {
        if (this.volume.style.display == 'none') {
            this.volume.style.display = 'inline';
        }
        else {
            this.volume.style.display = 'none';
        }
        ;
    };
    Main.prototype.setAlarmColor = function () {
        this.bgcolor.click();
    };
    Main.prototype.toggle24hrMode = function () {
        // Best to toggle both to skip confusion
        this.alarm.hr24Mode = this.clock.hr24Mode = !this.clock.hr24Mode;
        this.alarmMode = this.alarmMode;
        localStorage.setItem('mclock.hr24Mode', this.clock.hr24Mode.toString());
    };
    Main.prototype.incrementAlarmHours = function () {
        if (this.alarmMode) {
            if (!this.alarm.hr24Mode) {
                var time12 = this.alarm.time24.to12();
                time12.hours++;
                if (time12.hours > 12)
                    time12.hours = 1;
                this.alarm.time24 = Time.from12(time12);
            }
            else {
                var hours = this.alarm.time24.hours;
                hours++;
                if (hours > 23)
                    hours = 0;
                this.alarm.time24.hours = hours;
            }
            this.alarm.updateTime();
        }
        else if (this.timerMode) {
            if (!this.timer.hr24Mode) {
                var time12 = this.timer.time24.to12();
                time12.hours++;
                if (time12.hours > 12)
                    time12.hours = 1;
                this.timer.time24 = Time.from12(time12);
            }
            else {
                var hours = this.timer.time24.hours;
                hours++;
                if (hours > 23)
                    hours = 0;
                this.timer.time24.hours = hours;
            }
            this.timer.updateTime();
        }
    };
    Main.prototype.decrementAlarmHours = function () {
        if (this.alarmMode) {
            if (!this.alarm.hr24Mode) {
                var time12 = this.alarm.time24.to12();
                time12.hours--;
                if (time12.hours < 1)
                    time12.hours = 12;
                this.alarm.time24 = Time.from12(time12);
            }
            else {
                var hours = this.alarm.time24.hours;
                hours--;
                if (hours < 0)
                    hours = 23;
                this.alarm.time24.hours = hours;
            }
            this.alarm.updateTime();
        }
        else if (this.timerMode) {
            if (!this.timer.hr24Mode) {
                var time12 = this.timer.time24.to12();
                time12.hours--;
                if (time12.hours < 1)
                    time12.hours = 12;
                this.timer.time24 = Time.from12(time12);
            }
            else {
                var hours = this.timer.time24.hours;
                hours--;
                if (hours < 0)
                    hours = 23;
                this.timer.time24.hours = hours;
            }
            this.timer.updateTime();
        }
    };
    Main.prototype.incrementAlarmMinutes = function () {
        if (this.alarmMode) {
            var minutes = this.alarm.time24.minutes;
            minutes++;
            if (minutes > 59)
                minutes = 0;
            this.alarm.time24.minutes = minutes;
            this.alarm.updateTime();
        }
        else if (this.timerMode) {
            var minutes = this.timer.time24.minutes;
            minutes++;
            if (minutes > 59)
                minutes = 0;
            this.timer.time24.minutes = minutes;
            this.timer.updateTime();
        }
    };
    Main.prototype.decrementAlarmMinutes = function () {
        if (this.alarmMode) {
            var minutes = this.alarm.time24.minutes;
            minutes--;
            if (minutes < 0)
                minutes = 59;
            this.alarm.time24.minutes = minutes;
            this.alarm.updateTime();
        }
        else if (this.timerMode) {
            var minutes = this.timer.time24.minutes;
            minutes--;
            if (minutes < 0)
                minutes = 59;
            this.timer.time24.minutes = minutes;
            this.timer.updateTime();
        }
    };
    Main.prototype.alarmToAm = function () {
        if (this.alarmMode && !this.alarm.hr24Mode) {
            var time12 = this.alarm.time24.to12();
            time12.pm = false;
            this.alarm.time24 = Time.from12(time12);
            this.alarm.updateTime();
        }
    };
    Main.prototype.alarmToPm = function () {
        if (this.alarmMode && !this.alarm.hr24Mode) {
            var time12 = this.alarm.time24.to12();
            time12.pm = true;
            this.alarm.time24 = Time.from12(time12);
            this.alarm.updateTime();
        }
    };
    Main.prototype.loadAlarmMelodyFile = function () {
        $("#alarmTone").click();
    };
    Main.prototype.isLoadedAlarmMelodyFile = function () {
        if ($("#alarmTone").val()) {
            this.fileReader = new FileReader();
            this.fileReader.readAsDataURL($('#alarmTone')[0].files[0]);
            this.fileReader.onloadend = function () {
                localStorage.setItem('mclock.audio', this.fileReader.result);
                $("#player")[0].src = this.fileReader.result;
                this.fileReaderDone = true;
                $(".alarm-melody").addClass("toggled");
            }.bind(this);
        }
        else {
            $(".alarm-melody").removeClass("toggled");
            this.fileReader = undefined;
        }
    };
    Main.prototype.soundAlarm = function () {
        if (this.fileReader !== undefined && this.fileReaderDone) {
            if (this.alarmPlaying) {
                $("#player")[0].pause();
                $("#player")[0].currentTime = 0;
                $(".alarm-melody-play").removeClass("toggled");
                this.alarmPlaying = false;
            }
            else {
                $("#player")[0].play();
                $(".alarm-melody-play").addClass("toggled");
                this.alarmPlaying = true;
                // Disable sleep mode in case it was activated
                $(".alarm-snooze").removeClass("toggled");
                this.alarmSleepActivated = false;
            }
        }
    };
    Main.prototype.timerEnable = function () {
        this.timerEnabled = !this.timerEnabled;
        if (this.timerEnabled) {
            $(".timer-enable").prop("checked", true);
            this.timer.startTime = Math.floor(this.clock.time24.date.getTime() / 1000);
        }
        else {
            $(".timer-enable").prop("checked", false);
            this.timer.startTime = 0;
        }
    };
    Main.prototype.alarmEnable = function () {
        this.alarmEnabled = !this.alarmEnabled;
        if (this.alarmEnabled) {
            $(".alarm-enable").addClass("toggled");
        }
        else {
            $(".alarm-enable").removeClass("toggled");
            // Disable sleep mode in case it was activated
            $(".alarm-snooze").removeClass("toggled");
            this.alarmSleepActivated = false;
            if (this.alarmPlaying)
                this.soundAlarm();
        }
    };
    Main.prototype.alarmSleep = function () {
        // Only if the alarm is playing and enabled
        // and sleep hasnt been activated already
        if (this.alarmPlaying
            && this.alarmEnabled
            && !this.alarmSleepActivated) {
            // Activate sleep mode
            this.alarmSleepActivated = true;
            // Stop alarm
            this.soundAlarm();
            // Increase alarm by 5 minutes
            this.alarm.time24.minutes += 5;
            // Toggle snooze button
            $(".alarm-snooze").addClass("toggled");
        }
        // If sleep is pressed while its on and in-progress
        // Disable sleep and re-activate alarm
        else if (!this.alarmPlaying
            && this.alarmEnabled
            && this.alarmSleepActivated) {
            // Deactivate sleep mode
            this.alarmSleepActivated = false;
            // Restart alarm
            this.soundAlarm();
            // Disable Toggle snooze button
            $(".alarm-snooze").removeClass("toggled");
        }
    };
    Main.prototype.enableAlarmFeatures = function () {
        if (FileReader) {
            $("button:disabled").prop('disabled', false);
            $(".support").removeClass('not-supported');
            $(".support").addClass('supported');
        }
    };
    return Main;
}());
$(function () {
    $('.clock').removeClass('hidden');
    var main = new Main();
    window.main = main;
});
