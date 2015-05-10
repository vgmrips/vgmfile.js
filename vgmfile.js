Number.prototype.toTime = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor(sec_num / 60) % 60;
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours > 0 && hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10 && hours > 0) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = (hours > 0 ? hours+':' : '')+minutes+':'+seconds;
    return time;
};

Number.prototype.toBytes = function() {
	var sizes = ['', 'K', 'M', 'G', 'T'];
	if(this == 0) return '0';
	var i = parseInt(Math.floor(Math.log(this) / Math.log(1024)));
	return Math.round(this / Math.pow(1024, i), 2) + sizes[i];
};

function VGMFile(data) {
	if(data.byteLength < 1) throw 'Empty data';
	d = new DataView(data);

	if(d.getUint8(0) == 0x1f && d.getUint8(1) == 0x8b) {
		this.gzipped = true;
		var a = new Uint8Array(data);
		var g = new Zlib.Gunzip(a);
		d = new DataView(g.decompress().buffer);
	} else {
		this.gzipped = false;
	}

	// Check signature
	var sig = 'Vgm ';
	if(d.getUint8(0) !== sig.charCodeAt(0) ||
	   d.getUint8(1) !== sig.charCodeAt(1) ||
	   d.getUint8(2) !== sig.charCodeAt(2) ||
	   d.getUint8(3) !== sig.charCodeAt(3)) {
		throw 'VGM Signature invalid';
	}

	this.eofOffset         = d.getUint32(0x04, true);
	this.version           = d.getUint32(0x08, true);
	this.sn76489Clock      = d.getUint32(0x0c, true);
	this.ym2413Clock       = d.getUint32(0x10, true);
	this.gd3Offset         = d.getUint32(0x14, true);
	this.totalSamples      = d.getUint32(0x18, true);
	this.loopOffset        = d.getUint32(0x1c, true);
	this.loopSamples       = d.getUint32(0x20, true);
	this.rate              = this.version >= 0x101 ? d.getUint32(0x24, true) : 0;
	this.snFb              = this.version >= 0x110 ? d.getUint16(0x28, true) : 0;
	this.snw               = this.version >= 0x110 ? d.getUint8(0x2a, true) : 0;
	this.sf                = this.version >= 0x151 ? d.getUint8(0x2b) : 0;
	this.ym2612Clock       = this.version >= 0x110 ? d.getUint32(0x2c, true) : 0;
	this.ym2151Clock       = this.version >= 0x110 ? d.getUint32(0x30, true) : 0;
	this.vgmDataOffset     = this.version >= 0x150 ? d.getUint32(0x34, true) : 0x40;
	this.segaPCMClock      = this.vgmDataOffset >= 0x38 - 0x34 && this.version >= 0x151 ? d.getUint32(0x38, true) : 0;
	this.spcmInterface     = this.vgmDataOffset >= 0x3c - 0x34 && this.version >= 0x151 ? d.getUint32(0x3c, true) : 0;
	this.rf5c68Clock       = this.vgmDataOffset >= 0x40 - 0x34 && this.version >= 0x151 ? d.getUint32(0x40, true) : 0;
	this.ym2203Clock       = this.vgmDataOffset >= 0x44 - 0x34 && this.version >= 0x151 ? d.getUint32(0x44, true) : 0;
	this.ym2608Clock       = this.vgmDataOffset >= 0x48 - 0x34 && this.version >= 0x151 ? d.getUint32(0x48, true) : 0;
	this.ym2610bClock      = this.vgmDataOffset >= 0x4c - 0x34 && this.version >= 0x151 ? d.getUint32(0x4c, true) : 0;
	this.ym3812Clock       = this.vgmDataOffset >= 0x50 - 0x34 && this.version >= 0x151 ? d.getUint32(0x50, true) : 0;
	this.ym3526Clock       = this.vgmDataOffset >= 0x54 - 0x34 && this.version >= 0x151 ? d.getUint32(0x54, true) : 0;
	this.y8950Clock        = this.vgmDataOffset >= 0x58 - 0x34 && this.version >= 0x151 ? d.getUint32(0x58, true) : 0;
	this.ymf262Clock       = this.vgmDataOffset >= 0x5c - 0x34 && this.version >= 0x151 ? d.getUint32(0x5c, true) : 0;
	this.ymf278bClock      = this.vgmDataOffset >= 0x60 - 0x34 && this.version >= 0x151 ? d.getUint32(0x60, true) : 0;
	this.ymf271Clock       = this.vgmDataOffset >= 0x64 - 0x34 && this.version >= 0x151 ? d.getUint32(0x64, true) : 0;
	this.ymz280bClock      = this.vgmDataOffset >= 0x68 - 0x34 && this.version >= 0x151 ? d.getUint32(0x68, true) : 0;
	this.rf5c164Clock      = this.vgmDataOffset >= 0x6c - 0x34 && this.version >= 0x151 ? d.getUint32(0x6c, true) : 0;
	this.pwmClock          = this.vgmDataOffset >= 0x70 - 0x34 && this.version >= 0x151 ? d.getUint32(0x70, true) : 0;
	this.ay8910Clock       = this.vgmDataOffset >= 0x74 - 0x34 && this.version >= 0x151 ? d.getUint32(0x74, true) : 0;
	this.ayt               = this.vgmDataOffset >= 0x78 - 0x34 && this.version >= 0x151 ? d.getUint8(0x78) : 0;
	this.ayFlags           = this.vgmDataOffset >= 0x79 - 0x34 && this.version >= 0x151 ? d.getUint8(0x79) | (d.getUint8(0x7a) << 8) | (d.getUint8(0x7b) << 8) : 0;
	this.vm                = this.vgmDataOffset >= 0x7c - 0x34 && this.version >= 0x160 ? d.getUint8(0x7c) : 0;
	this.lb                = this.vgmDataOffset >= 0x7e - 0x34 && this.version >= 0x160 ? d.getUint8(0x7e) : 0;
	this.lm                = this.vgmDataOffset >= 0x7f - 0x34 && this.version >= 0x151 ? d.getUint8(0x7f) : 0;
	this.gbDmgClock        = this.vgmDataOffset >= 0x80 - 0x34 && this.version >= 0x161 ? d.getUint32(0x80, true) : 0;
	this.nesApuClock       = this.vgmDataOffset >= 0x84 - 0x34 && this.version >= 0x161 ? d.getUint32(0x84, true) : 0;
	this.multiPCMClock     = this.vgmDataOffset >= 0x88 - 0x34 && this.version >= 0x161 ? d.getUint32(0x88, true) : 0;
	this.upd7759Clock      = this.vgmDataOffset >= 0x8c - 0x34 && this.version >= 0x161 ? d.getUint32(0x8c, true) : 0;
	this.okim6258Clock     = this.vgmDataOffset >= 0x90 - 0x34 && this.version >= 0x161 ? d.getUint32(0x90, true) : 0;
	this.of                = this.vgmDataOffset >= 0x94 - 0x34 && this.version >= 0x161 ? d.getUint8(0x94) : 0;
	this.kf                = this.vgmDataOffset >= 0x95 - 0x34 && this.version >= 0x161 ? d.getUint8(0x95) : 0;
	this.cf                = this.vgmDataOffset >= 0x96 - 0x34 && this.version >= 0x161 ? d.getUint8(0x96) : 0;
	this.okim6295Clock     = this.vgmDataOffset >= 0x98 - 0x34 && this.version >= 0x161 ? d.getUint32(0x98, true) : 0;
	this.k051649Clock      = this.vgmDataOffset >= 0x9c - 0x34 && this.version >= 0x161 ? d.getUint32(0x9c, true) : 0;
	this.k054539Clock      = this.vgmDataOffset >= 0xa0 - 0x34 && this.version >= 0x161 ? d.getUint32(0xa0, true) : 0;
	this.huc6280Clock      = this.vgmDataOffset >= 0xa4 - 0x34 && this.version >= 0x161 ? d.getUint32(0xa4, true) : 0;
	this.c140Clock         = this.vgmDataOffset >= 0xa8 - 0x34 && this.version >= 0x161 ? d.getUint32(0xa8, true) : 0;
	this.k053260Clock      = this.vgmDataOffset >= 0xac - 0x34 && this.version >= 0x161 ? d.getUint32(0xac, true) : 0;
	this.pokeyClock        = this.vgmDataOffset >= 0xb0 - 0x34 && this.version >= 0x161 ? d.getUint32(0xb0, true) : 0;
	this.qSoundClock       = this.vgmDataOffset >= 0xb4 - 0x34 && this.version >= 0x161 ? d.getUint32(0xb4, true) : 0;
	this.extraHeaderOffset = this.vgmDataOffset >= 0xbc - 0x34 && this.version >= 0x170 ? d.getUint32(0xbc, true) : 0;

	var gd3Tags = [
		'trackNameEn',
		'trackNameJp',
		'gameNameEn',
		'gameNameJp',
		'systemNameEn',
		'systemNameJp',
		'trackAuthorEn',
		'trackAuthorJp',
		'releaseDate',
		'convertedBy',
		'notes'
	];
	for(t in gd3Tags) this[gd3Tags[t]] = '';
	var go = this.gd3Offset;
	if(go) {
		go += 0x14;
		var gd3Sig = 'Gd3 ';
		if(d.getUint8(go + 0) !== gd3Sig.charCodeAt(0) ||
		   d.getUint8(go + 1) !== gd3Sig.charCodeAt(1) ||
		   d.getUint8(go + 2) !== gd3Sig.charCodeAt(2) ||
		   d.getUint8(go + 3) !== gd3Sig.charCodeAt(3)) {
			throw 'GD3 Signature invalid';
		}
		this.gd3Version = d.getUint32(go + 4, true);
		this.gd3Length = d.getUint32(go + 8, true);
		var gd3Strings = {};
		var s = 0;
		for(var i = 0; i < this.gd3Length; i += 2) {
			var c = d.getUint16(go + 12 + i, true);
			if(c == 0) s++;
			else {
				var tag = gd3Tags[s];
				if(!gd3Strings[tag]) gd3Strings[tag] = '';
				gd3Strings[tag] += String.fromCharCode(c);
			}
		}
		for(s in gd3Tags) {
			if(gd3Strings[gd3Tags[s]]) this[gd3Tags[s]] = gd3Strings[gd3Tags[s]];
		}
	}

	this.getLoopTime = function() {
		return this.loopSamples > 0 ? Math.round(this.loopSamples / 44100).toTime() : null;
	};

	this.getTotalTime = function() {
		return Math.round(this.totalSamples / 44100).toTime();
	};

	this.dumpHeader = function() {
		console.log('version',          '0x'+this.version.toString(16));
		console.log('eofOffset',        '0x'+this.eofOffset.toString(16));
		console.log('sn76489Clock',      this.sn76489Clock);
		console.log('ym2413Clock',       this.ym2413Clock);
		console.log('gd3Offset',         this.gd3Offset);
		console.log('totalSamples',      this.totalSamples);
		console.log('loopOffset',        this.loopOffset);
		console.log('loopSamples',       this.loopSamples);
		console.log('rate',              this.rate);
		console.log('snFb',              this.snFb);
		console.log('snw',               this.snw);
		console.log('sf',                this.sf);
		console.log('ym2612Clock',       this.ym2612Clock);
		console.log('ym2151Clock',       this.ym2151Clock);
		console.log('vgmDataOffset',     this.vgmDataOffset);
		console.log('segaPCMClock',      this.segaPCMClock);
		console.log('spcmInterface',     this.spcmInterface);
		console.log('rf5c68Clock',       this.rf5c68Clock);
		console.log('ym2203Clock',       this.ym2203Clock);
		console.log('ym2608Clock',       this.ym2608Clock);
		console.log('ym2610bClock',      this.ym2610bClock);
		console.log('ym3812Clock',       this.ym3812Clock);
		console.log('ym3526Clock',       this.ym3526Clock);
		console.log('y8950Clock',        this.y8950Clock);
		console.log('ymf262Clock',       this.ymf262Clock);
		console.log('ymf278bClock',      this.ymf278bClock);
		console.log('ymf271Clock',       this.ymf271Clock);
		console.log('ymz280bClock',      this.ymz280bClock);
		console.log('rf5c164Clock',      this.rf5c164Clock);
		console.log('pwmClock',          this.pwmClock);
		console.log('ay8910Clock',       this.ay8910Clock);
		console.log('ayt',               this.ayt);
		console.log('ayFlags',           this.ayFlags);
		console.log('vm',                this.vm);
		console.log('lb',                this.lb);
		console.log('lm',                this.lm);
		console.log('gbDmgClock',        this.gbDmgClock);
		console.log('nesApuClock',       this.nesApuClock);
		console.log('multiPCMClock',     this.multiPCMClock);
		console.log('upd7759Clock',      this.upd7759Clock);
		console.log('okim6258Clock',     this.okim6258Clock);
		console.log('of',                this.of);
		console.log('kf',                this.kf);
		console.log('cf',                this.cf);
		console.log('okim6295Clock',     this.okim6295Clock);
		console.log('k051649Clock',      this.k051649Clock);
		console.log('k054539Clock',      this.k054539Clock);
		console.log('huc6280Clock',      this.huc6280Clock);
		console.log('c140Clock',         this.c140Clock);
		console.log('k053260Clock',      this.k053260Clock);
		console.log('pokeyClock',        this.pokeyClock);
		console.log('qSoundClock',       this.qSoundClock);
		console.log('extraHeaderOffset', this.extraHeaderOffset);
	};

	this.dumpGD3 = function() {
		for(i in this.gd3Strings) {
			console.info('%c%s:%c %s', 'font-weight: bold', i, 'font-weight: normal', this.gd3Strings[i]);
		}
	};

	this.getChips = function() {
		var chips = [];
		if(this.sn76489Clock)  chips.push({ name: 'SN76489',     clock: this.sn76489Clock, feedback: this.snFb, shiftRegisterWidth: this.snw, flags: this.sf });
		if(this.ym2413Clock)   chips.push({ name: 'YM2413',      clock: this.ym2413Clock   });
		if(this.ym2612Clock)   chips.push({ name: 'YM2612',      clock: this.ym2612Clock   });
		if(this.ym2151Clock)   chips.push({ name: 'YM2151',      clock: this.ym2151Clock   });
		if(this.segaPCMClock)  chips.push({ name: 'SegaPCM',     clock: this.segaPCMClock, interfaceRegister: this.spcmInterface });
		if(this.rf5c68Clock)   chips.push({ name: 'RFC5C68',     clock: this.rf5c68Clock  });
		if(this.ym2203Clock)   chips.push({ name: 'YM2203',      clock: this.ym2203Clock   });
		if(this.ym2608Clock)   chips.push({ name: 'YM2608',      clock: this.ym2608Clock   });
		if(this.ym2610bClock)  chips.push({ name: (this.ym2610bClock & 0x8000000) ? 'YM2610B' : 'YM2610',     clock: this.ym2610bClock  });
		if(this.ym3812Clock)   chips.push({ name: 'YM3812',      clock: this.ym3812Clock   });
		if(this.ym3526Clock)   chips.push({ name: 'YM3526',      clock: this.ym3526Clock   });
		if(this.y8950Clock)    chips.push({ name: 'Y8950',       clock: this.y8950Clock    });
		if(this.ymf262Clock)   chips.push({ name: 'YMF262',      clock: this.ymf262Clock   });
		if(this.ymf278bClock)  chips.push({ name: 'YMF278B',     clock: this.ymf278bClock  });
		if(this.ymf271Clock)   chips.push({ name: 'YMF271',      clock: this.ymf271Clock   });
		if(this.ymz280bClock)  chips.push({ name: 'YMZ280B',     clock: this.ymz280bClock  });
		if(this.rf5c164Clock)  chips.push({ name: 'RF5C164',     clock: this.rf5c164Clock  });
		if(this.pwmClock)      chips.push({ name: 'PWM',         clock: this.pwmClock      });
		if(this.ay8910Clock)   chips.push({ name: 'AY8910',      clock: this.ay8910Clock, type: this.ayt, flags: this.ayFlags });
		if(this.gbDmgClock)    chips.push({ name: 'GameBoy DMG', clock: this.gbDmgClock    });
		if(this.nesApuClock)   chips.push({ name: 'NES APU',     clock: this.nesApuClock   });
		if(this.multiPCMClock) chips.push({ name: 'MultiPCM',    clock: this.multiPCMClock });
		if(this.upd7759Clock)  chips.push({ name: 'uPD7759',     clock: this.upd7759Clock  });
		if(this.okim6258Clock) chips.push({ name: 'OKIM6258',    clock: this.okim6258Clock, flags: this.of });
		if(this.okim6295Clock) chips.push({ name: 'OKIM6295',    clock: this.okim6295Clock });
		if(this.k051649Clock)  chips.push({ name: 'K051649',     clock: this.k051649Clock  });
		if(this.k054539Clock)  chips.push({ name: 'K054539',     clock: this.k054539Clock, flags: this.kf });
		if(this.huc6280Clock)  chips.push({ name: 'HuC6280',     clock: this.huc6280Clock  });
		if(this.c140Clock)     chips.push({ name: 'C140',        clock: this.c140Clock, type: this.cf });
		if(this.k053260Clock)  chips.push({ name: 'K053260',     clock: this.k053260Clock  });
		if(this.pokeyClock)    chips.push({ name: 'Pokey',       clock: this.pokeyClock    });
		if(this.qSoundClock)   chips.push({ name: 'QSound',      clock: this.qSoundClock   });
		var doubleChips = [
			'SN76489', 'YM2413', 'YM2612', 'YM2151',
			'YM2203', 'YM2608', 'YM2610', 'YM3812',
			'YM3526', 'Y8950', 'YMZ280B', 'YMF262',
			'YMF278B', 'YMF271', 'AY8910', 'GameBoy DMG',
			'NES APU', 'MultiPCM', 'uPD7759', 'OKIM6258',
			'OKIM6295', 'K051649', 'K054539', 'HuC6280',
			'C140', 'K053260', 'Pokey'
		];
		for(i in chips) {
			var chip = chips[i];
			if(doubleChips.indexOf(chip.name) !== -1 && chip.clock & 0x40000000) {
				chips[i].clock &= 0xbfffffff;
				chips[i].multiplier = 2;
			} else chips[i].multiplier = 1;
		}
		return chips;
	};
}
