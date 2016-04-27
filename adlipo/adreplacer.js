// TODO: vertical align (w height of p-tag), fix piratebay?
var EDIT = 0, dbug=0,adreplacer = {
	
	count : 0,
	port : 8089,
	fontName : 'custom',
	//host : EDIT ? 'localhost' : 'rednoise.org', 
	fontPath : 'adlipo/fonts/BenchNine.ttf', 
	palette : ['#4484A4','#A2B6C0','#889D59','#CF8D2F','#C55532'],
	docUrl : 'http://rednoise.org/adlipo/elo.html', //'http://rednoise.org/adlipo/'
	
	replace : function(el, elType, blocked) {
		
		if (elType & (ElementTypes.image | ElementTypes.subdocument | ElementTypes.object)) {
				
			if (this._inHiddenSection(el)) {
				
				this._replaceHiddenSectionContaining(el);
				return;
			}
			
			// this  used to be _iframeReplace()
			(el.nodeName !== "FRAME") && (this._doReplace(el));	
		}
	},
	
	_getFloatStyle : function(e) {
		
		var fstyle, node = e;
		do { 
			fstyle = window.getComputedStyle(node)["float"];
			node = node.parent;
			if (!node) break;
		} 
		while (!fstyle || fstyle === 'none');
			
		return fstyle === 'none' ? 'left' : fstyle;
	},
	
	_doReplace : function(el) {

		var req, durl = this.docUrl, href, pad = 5,
		  w = this._dim(el, 'width'), 
		  h = this._dim(el, 'height');

		if (el.tagName.toLowerCase() === "img") {
			
			href = this._handleParentAnchor(el);
		}
		else if (el.tagName.toLowerCase() === "div") {
			log("FOUND DIV... ");
		}
		else {
			if (dbug)log("FOUND UNKNOWN***: "+el.tagName);
		}
		
		if (dbug)log("FOUND-AD: "+w+"x"+h+" ("+el.tagName+")");		

		if (w && h && w > 50 && h > 40) {
			
			this._checkInjectedFont(this.fontName, this.fontPath);
		
			var div = document.createElement('div');
			div.setAttribute('class', 'adlipo');
			div.setAttribute('style', 'width: '+w + 'px; height:' + h+'px; '
				+ 'background-color: '+this.palette[++this.count % this.palette.length]+'; '
				+ 'color: #ffffff; font-family: custom; fontSize: 20px; text-align: center; '
				+ 'display: table-cell; vertical-align: middle; '
				+ 'float: '+this._getFloatStyle(el));//+'; overflow: hidden;'); // fixes nytimes top-banner
			
			//var cs = el.getComputedStyle(), w = cs.width, h = cs.height, 
			//var div = document.createElement('div'), css = 'width:' + w + 'px; height:' + h +
				// 'px; background-color: '+this.palette[++this.count % this.palette.length]+';';
			// css += ' float:left;  padding: '+(pad/2)+'px '+pad+'px '+pad+'px '+pad+'px; border: 0px;'; 
			// css += ' overflow-x: hidden; overflow-y: hidden; color: #ffffff;';
			// css += ' background-color: '+this.palette[++this.count % this.palette.length]+';';
			//css += " float:"+(window.getComputedStyle(el)["float"] || undefined)+";"; // fixes nytimes top-banner
	
			//div.style.cssText = css;
		
			div.innerHTML = '<br>AdLipo...';
			this._localReplace(w,h,pad);
		}
		else {
			if (dbug)log("HTML(too-small): "+w+','+h);//+" href="+(href?href:"none"));
			return;
		}

		if (dbug)log("REPLACE-AD: "+w+','+h);//+" href="+(href?href:"none"));
		
	 	el.parentNode.replaceChild(div, el); 
	},	
	
	// 2/21/15: WORKING HERE ***
	
	_localReplace : function(w,h,pad) {
	    
	    log('_localReplace('+w+','+h+','+pad+')');
	},
  
    _remoteReplace : function(w,h,pad) {
        
       var keys = this._keywords(); // cache on parent-url?

	   var url = encodeURI('http://' + this.host + ':' + this.port +
            '?w=' + w + '&h=' + h+ '&m=' + pad+'&keys='+keys+'&ts='+(+new Date()));
        
        if (dbug) log("SERVER: ", url, (href ? href : 'null'));
        
        (req = new XMLHttpRequest()).open('GET', url , true);
        
        // make rednoise...
        req.onload = function() {
            
            var poem = JSON.parse(req.responseText), html = '';
            
            //log("SERVER-RESULT: ",poem);
            for (var i = 0, j = poem.lines.length; i < j; i++) {
                
                html += poem.lines[i]
                if (i < poem.lines.length - 1) 
                    html += '<br/>';
            }

            var atag = document.createElement('span');
            atag.style['text-decoration'] = "none";
            atag.setAttribute('target', 'new');
            atag.setAttribute('title', 'AdLiPo');
            atag.setAttribute('href', durl);

            EDIT && log(html.replace(/<br\/>/g,' ').replace(/ +/g,' '));
    
            var ptag = document.createElement('p');
            ptag.style['letter-spacing'] = '0';
            //ptag.style['overflow'] = 'hidden';
            ptag.style.margin = '0px';
            ptag.style.display = 'block!important';
            //ptag.style['text-decoration'] = 'none';
            ptag.style.padding    = pad+'px 0px 0px '+pad+'px';
            ptag.style.fontSize   = poem.fontSize + 'px';
            ptag.style.lineHeight = Math.round(poem.leading) + '%';
            ptag.style.fontFamily = 'custom';
            ptag.style.textAlign  = poem.align;
            ptag.style.color = '#ffffff';
            ptag.innerHTML = html;
            
            // var pw = (ptag.clientWidth + 1) + "px";
            // var ph = (ptag.clientHeight + 1) + "px";
            // log(pw+','+ph);
            
            atag.appendChild(ptag); 
            
            div.innerHTML = '';
            div.appendChild(atag);          
        }
        
        req.send(null);
    },  
    
 	_keywords : function() {
		
	    var keywords = '';
	    var metas = document.getElementsByTagName('meta');
	    if (metas) {
	        for (var x=0,y=metas.length; x<y; x++) {
	            if (metas[x].name.toLowerCase() == "keywords") {
	                keywords += metas[x].content;
	            }
	        }
	    }
	    return keywords != '' ? keywords : false;
	},

	_dim: function(el, prop) {
		
	  function intFor(val) {
	    // Match two or more digits; treat < 10 as missing.  This lets us set
	    // dims that look good for e.g. 1px tall ad holders (cnn.com footer.)
	    var match = (val || "").match(/^([1-9][0-9]+)(px)?$/);
	    if (!match) return undefined;
	    return parseInt(match[1]);
	  }
	  if (prop === 'height') {
	  	if (el.offsetHeight) {
	  		return el.offsetHeight;
	  	}
	  	if (el.style && el.style.height) 
	  		return (el.style.height);
	  }
	  return ( intFor(el.getAttribute(prop)) || intFor(window.getComputedStyle(el)[prop]) );
	},
	
	_parentDim: function(el, prop) {
		
	  // Special hack for Facebook, so Sponsored links are huge and beautiful
	  // pictures instead of tiny or missing.
	  if (/facebook/.test(document.location.href))
	    return undefined;
	  var result = undefined;
	  while (!result && el.parentNode) {
	    result = this._dim(el.parentNode, prop);
	    el = el.parentNode;
	  }
	  return result;
	},
	
	_targetSize: function(el) {
	  var t = { x: this._dim(el, "width"), y: this._dim(el, "height") };
	  // Make it rectangular if ratio is appropriate, or if we only know one dim
	  // and it's so big that the 180k pixel max will force the pic to be skinny.
	  if (t.x && !t.y && t.x > 400)
	    t.type = "wide";
	  else if (t.y && !t.x && t.y > 400)
	    t.type = "tall";
	  else if (Math.max(t.x,t.y) / Math.min(t.x,t.y) >= 2) // false unless (t.x && t.y)
	    t.type = (t.x > t.y ? "wide" : "tall");
	
	  if (!t.type) // we didn't choose wide/tall
	    t.type = ((t.x || t.y) > 125 ? "big" : "small");
	  return t;
	},
		
	// Given a target element, replace it with a picture.
	// Returns the replacement element if replacement works, or null if the target
	// element could not be replaced.
	_iframeReplace: function(el) {
	 		 		
  		var w = this._dim(el, "width"), h = this._dim(el, "height");
  		
		var iframe = document.createElement("iframe");
		iframe.setAttribute("class", "ouliframe");
		iframe.setAttribute("src", "http://rednoise.org/adlipo/content.html");
		iframe.setAttribute("scrolling", "no");
		iframe.setAttribute("frameborder", "0");	
		//iframe.setAttribute("style", "border:none; width:"+w+"px; height: "+h+"px; background-color: #f00;");
		//iframe.setAttribute("style", "border:none; width:150px; height:30px");
	
	 	iframe.style.visibility = "visible";
		iframe.style.display = "block";
		iframe.style.width = w + "px";
		iframe.style.height = h + "px";
		iframe.style.position = "absolute";
		iframe.style.top = "0px";
		iframe.style.color = "red";
		iframe.style.zIndex = "101";

		iframe.onload = function() {
  			console.log("iFrame Loaded");
		};
		
  		el.dataset.picreplacementreplaced = "true";
  		el.parentNode.insertBefore(iframe, el);
  		
		//document.body.appendChild(iframe); 
	},

	// Add an info card to |newPic| that appears on hover.
	_addInfoCardTo: function(newPic, placement) {
		
	  if (newPic.infoCard)
	    return;
	  // We use a direct sendRequest onmouseenter to avoid modifying
	  // emit_page_broadcast; we won't need this hovercard long though, after which
	  // the code can all be deleted.  Create card the first time we mouseover.
	  // Then we can use jQuery's mouseenter and mouseleave to control when the
	  // card comes and goes.
	  newPic.addEventListener("mouseover", function(e) {
	    if (newPic.infoCard)
	      return; // already created card
	    function after_jquery_is_available() {
	      var cardsize = { 
	        width: Math.max(placement.width, 180), 
	        height: Math.max(placement.height, 100) 
	      };
	      function position_card(card) {
	        var pos = $(newPic).offset();
	        pos.top += (placement.height - cardsize.height) / 2;
	        pos.left += (placement.width - cardsize.width) / 2;
	        if (pos.top < 0) pos.top = 0; if (pos.left < 0) pos.left = 0;
	        card.css(pos);
	      };
	
	      newPic.infoCard = $("<div>", {
	        "class": "picreplacement-infocard",
	        css: { 
	          "position": "absolute",
	          "min-width": cardsize.width,
	          "min-height": cardsize.height,
	          "z-index": 1000000,
	          "padding": 3,
	          "box-sizing": "border-box",
	          "border": "2px solid rgb(128, 128, 128)",
	          "font": "normal small Arial, sans-serif",
	          "color": "black",
	          "background-color": "rgba(188, 188, 188, 0.7)",
	        } });
	      newPic.infoCard.appendTo("body");
	      newPic.infoCard.
	        append($("<img>", {
	          css: {
	            float: "right",
	            // independent.co.uk borders all imgs
	            border: "none",
	          },
	          src: chrome.extension.getURL("img/icon24.png") 
	        })).
	        append("<br>");
	
	      var wrapper = $("<div>", {
	        css: {
	          "max-width": 180,
	          "margin": "0 auto",
	          "text-align": "center"
	        }
	      });
	      var translate = picreplacement.translate;
	      wrapper.
	        append(translate("explanation") + " ").
	        append($("<a>", { 
	            href: translate("the_url"),
	            target: "_blank",
	            text: translate("learn_more")
	          })).
	        append("<br>").
	        append("<br>");
	      $("<input type='button' disabled>").
	        val(translate("stop_showing")).
	        css("opacity", ".4").
	        click(function() {
	          BGcall("set_setting", "do_picreplacement", false, function() {
	            $(".picreplacement-image, .picreplacement-infocard").remove();
	            alert(translate("ok_no_more"));
	          });
	        }).
	        appendTo(wrapper);
	      wrapper.appendTo(newPic.infoCard);
	      wrapper.css("margin-top", (newPic.infoCard.height() - wrapper.height()) / 2);
	
	      // Now that all the elements are on the card so it knows its height...
	      position_card(newPic.infoCard);
	
	      $(newPic).mouseover(function() {
	        $(".picreplacement-infocard:visible").hide();
	        // newPic may have moved relative to the document, so recalculate
	        // position before showing.
	        position_card(newPic.infoCard);
	        newPic.infoCard.show();
	      });
	      // Known bug: mouseleave is not called if you mouse over only 1 pixel
	      // of newPic, then leave.  So infoCard is not removed.
	      newPic.infoCard.mouseleave(function() { 
	        $(".picreplacement-infocard:visible").hide();
	      });
	
	      // The first time I show the card, the button is disabled.  Enable after
	      // a moment so the user can read the card first.
	      window.setTimeout(function() {
	        newPic.infoCard.find("input").
	          attr("disabled", null).
	          animate({opacity: 1});
	      }, 2000);
	    }
	    if (typeof jQuery !== "undefined") {
	      after_jquery_is_available();
	    }
	    else {
	      chrome.extension.sendRequest(
	        { command:"picreplacement_inject_jquery", allFrames: (window !== window.top) }, 
	        after_jquery_is_available
	      );
	    }
	  }, false);
	},
	
	// Returns true if |el| or an ancestor was hidden by an AdLiPo hiding rule.
	_inHiddenSection: function(el) {
	  return window.getComputedStyle(el).orphans === "4321";
	},
	
	// Find the ancestor of el that was hidden by AdLiPo, and replace it
	// with a picture.  Assumes _inHiddenSection(el) is true.
	_replaceHiddenSectionContaining: function(el) {
	  
	  // Find the top hidden node (the one AdLiPo originally hid)
	  while (this._inHiddenSection(el.parentNode))
	    el = el.parentNode;
	    
	  // We may have already replaced this section...
	  if (el.dataset.picreplacementreplaced)
	    return;
	
	  var oldCssText = el.style.cssText; // tmp set these:
	  el.style.setProperty("visibility", "hidden", "important");
	  el.style.setProperty("display", "block", "important");
	  
	  this._doReplace(el); // then replace
	
	  el.style.cssText = oldCssText; // Re-hide the section
	},
	
	_checkInjectedFont : function(fName, fPath) {
		
		// check if our fontface exists for this page
		var exists = false, styles = document.getElementsByTagName("style");
		for (var i=0; i < styles.length; i++) {
		  if (styles[i].textContent.indexOf(chrome.runtime.id) > 0) {
		  	exists = true;
		  	break;
		  }
		};
		
		if (!exists) { // if not, then inject it
			
			var fa = document.createElement('style');
			var furl = chrome.extension.getURL(fPath);
			//log("FONT: "+furl);
			fa.type = 'text/css';
			fa.textContent = '@font-face { font-family: '+fName+'; src: url("'+furl+'"); }';
			document.head.appendChild(fa); 
		}
	},	
	
	translate: function(key) {
	  var text = {
	    "explanation": {
	      en: "AdLiPo now shows you poems instead of ads!",
	      es: "AdLiPo ahora muestra los gatos en lugar de anuncios!",
	      fr: "Dorénavant AdLiPo affichera des chats à la place des publicités!",
	      de: "AdLiPo ersetzt ab heute Werbung durch Katzen!",
	      ru: "AdLiPo теперь отображается кошек вместо рекламы!",
	      nl: "AdLiPo toont je nu katten in plaats van advertenties!",
	      zh: "现在显示的AdLiPo猫，而不是广告！",
	    },
	    "stop_showing": {
	      en: "Stop showing me poems!",
	      es: "No mostrar los gatos!",
	      fr: "Arrêter l'affichage des chats!",
	      de: "Keine Katzen mehr anzeigen!",
	      ru: "Не показывать кошек!",
	      nl: "Toon geen katten meer!",
	      zh: "不显示猫图片！",
	    },
	    "ok_no_more": {
	      en: "OK, AdLiPo will not show you any more poems.\n\nHappy April Fools' Day!",
	      es: "OK, AdLiPo no te mostrará los gatos.\n\nFeliz Día de los Inocentes!",
	      fr: "OK, AdLiPo n'affichera plus de chats.\n\nJ'espère que mon poisson d'avril vous a plu!",
	      de: "AdLiPo wird keine Katzen mehr anzeigen.\n\nApril, April!",
	      ru: "Хорошо, AdLiPo не будет отображаться кошек.\n\nЕсть счастливый День дурака",
	      nl: "1 April!!\n\nAdLiPo zal vanaf nu geen katten meer tonen.",
	      zh: "OK，的AdLiPo不会显示猫。\n\n幸福四月愚人节！",
	    },
	    "new": {
	      en: "New!",
	      es: "Nuevo!",
	      fr: "Nouveau!",
	      de: "Neu!",
	      ru: "новое!",
	      nl: "Nieuw!",
	      zh: "新！",
	    },
	    "enable_picreplacement": {
	      en: "Show me 'literature' in place of ads.",
	      es: "Mostrar una foto bonita en lugar de anuncios.",
	      fr: "Afficher des belles images à la place des publicités.",
	      de: "Werbung durch schöne Bilder ersetzen.",
	      ru: "Показать красивую картинку вместо объявления.",
	      nl: "Toon een leuke afbeelding op de plaats waar advertenties stonden.",
	      zh: "显示漂亮的照片，而不是广告。",
	    },
	    "learn_more": {
	      en: "Learn more",
	      es: "Más información",
	      fr: "En savoir plus",
	      de: "Mehr Informationen",
	      ru: "Подробнее",
	      nl: "Meer informatie",
	      zh: "了解更多信息",
	    },
	    "the_url": {
	    	
	      // don't translate into other locales
	      en: "http://rednoise.org/adlipo/"
	    }
	  };
	  var locale = navigator.language.substring(0, 2);
	  var msg = text[key] || {};
	  return msg[locale] || msg["en"];
	},
	
	_handleParentAnchor : function(img) { 
		// what about parent of parent of... ?
		var href = null;
	    if (img.parentNode.tagName.toLowerCase()=='a') { 
			href = img.parentNode.href;
			img.parentNode.style.cssText = "text-decoration: none!important;";
			img.parentNode.setAttribute("href", this.docUrl);
	    }
		return href;
	}

}; // end adreplacer