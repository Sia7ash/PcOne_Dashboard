/*
 * PcOne Dashboard
 * Copyright (c) 2014-2016 - Sia7asH @ Pcone.Us
 * A3PIK | man4toman | silenceIsMyFun | Arazar | mammad65 @PcOne.Us
 * All rights reserved.
 *
 * Code licensed under the BSD License
 */

/*
 * Ext JS Library 2.2
 * Copyright(c) 2006-2008, Ext JS, LLC.
 * licensing@extjs.com
 *
 * http://extjs.com/license
 */

Ext.form.TextField.prototype.selectOnFocus = true;

// Done : middle click should close the tab!
Ext.ux.TabCloseOnMiddleClick = function(){
	this.init = function(tp){
		tp.onStripMouseDown = Ext.TabPanel.prototype.onStripMouseDown.createSequence(function(e){
			try{
				var t = this.findTargets(e);
				var b = e.browserEvent.button
				var w = e.browserEvent.which
				var isMiddleButtonPressed = (w === null || w === undefined)?b==4:w==2; // browser dependent: http://unixpapa.com/js/mouse.html
				if (isMiddleButtonPressed && t && t.item && t.item.closable) {
					this.remove(t.item);
					return;
				}
			}catch(it){
                //debug.log('try-catch-it',it)
            }
		})
	};
};
// Very simple plugin for adding a close context menu to tabs
Ext.ux.TabCloseMenu = function(){
    var tabs, menu, ctxItem;
    this.init = function(tp){
        tabs = tp;
        tabs.on('contextmenu', onContextMenu);
    }
    function onContextMenu(ts, item, e){
        if(!menu){ // create context menu on first right click
            menu = new Ext.menu.Menu([{
                id: tabs.id + '-close',
                text: 'Close Tab',
                handler : function(){
                    tabs.remove(ctxItem);
                }
            },{
                id: tabs.id + '-close-others',
                text: 'Close Other Tabs',
                handler : function(){
                    tabs.items.each(function(item){
                        if(item.closable && item != ctxItem){
                            tabs.remove(item);
                        }
                    });
                }
            }]);
        }
        ctxItem = item;
        var items = menu.items;
        items.get(tabs.id + '-close').setDisabled(!item.closable);
        var disableOthers = true;
        tabs.items.each(function(){
            if(this != item && this.closable){
                disableOthers = false;
                return false;
            }
        });
        items.get(tabs.id + '-close-others').setDisabled(disableOthers);
        menu.showAt(e.getPoint());
    }
};

// TODO : sync the snippets with Ext 2.2.1 code
/**
 * BBCode Editor
 * This code based on MyEngine BBCode Editor (beta)
 *
 * Author dSorrow
 * http://www.pcseven.com
 */
Ext.ux.BBCodeEditor = Ext.extend(Ext.form.Field, {
    /**
     * @cfg {Boolean} enableFormat Enable the bold, italic and underline buttons (defaults to true)
     */
    enableFormat: true,
    /**
     * @cfg {Boolean} enableColors Enable the fore/highlight color buttons (defaults to true)
     */
    enableColors: true,
    /**
     * @cfg {Boolean} enableAlignments Enable the left, center, right alignment buttons (defaults to true)
     */
    enableAlignments: true,
    /**
     * @cfg {Boolean} enableLinks Enable the create link button. (defaults to true)
     */
    enableLinks: true,
    /**
     * @cfg {Boolean} enableImages Enable the create img button. (defaults to true)
     */
    enableImages: true,
    /**
     * @cfg {Boolean} enableFont Enable font size selection. (defaults to true)
     */
    enableFont: true,
    /**
     * @cfg {String} createLinkText The default text for the create link prompt
     */
    createLinkText: 'Please enter the URL for the link:',
    /**
     * @cfg {String} defaultLinkValue The default value for the create link prompt (defaults to http:/ /)
     */
    defaultLinkValue: 'http:/'+'/',
    /**
     * @cfg {String} createLinkText The default text for the create link prompt
     */
    createImageText: 'Please enter the URL for the image:',
    /**
     * @cfg {String} defaultLinkValue The default value for the create link prompt (defaults to http:/ /)
     */
    defaultImageValue: 'http:/'+'/',
    /**
     * @cfg {Array} fontFamilies An array of available font families
     */
    fontSizes: [11, 12, 14, 16, 18],

    defaultFont: 11,

    // private properties
    validationEvent: false,
    deferHeight: true,
    initialized: false,
    activated: false,
    onFocus: Ext.emptyFn,
    hideMode: 'offsets',
    defaultAutoCreate: {
        tag: "textarea",
        style: "width:100%;height:200px;",
        autocomplete: "off"
    },

    // private
    initComponent : function(){
        this.addEvents(
            /**
             * @event initialize
             * Fires when the editor is fully initialized (including the iframe)
             * @param {HtmlEditor} this
             */
            'initialize',

            /**
             * @event activate
             * Fires when the editor is first receives the focus. Any insertion must wait
             * until after this event.
             * @param {HtmlEditor} this
             */
            'activate'
        )
    },

    createFontOptions : function(){
        var buf = [], fs = this.fontSizes, ff;
        for(var i = 0, len = fs.length; i< len; i++){
            ff = fs[i];
            buf.push(
                '<option value="', ff, '"',
                    (this.defaultFont == ff ? ' selected="true">' : '>'),
                    ff, 'px',
                '</option>'
            );
        }
        return buf.join('');
    },

    /*
     * Protected method that will not generally be called directly. It
     * is called when the editor creates its toolbar. Override this method if you need to
     * add custom toolbar buttons.
     * @param {HtmlEditor} editor
     */
    createToolbar : function(editor){
        function btn(id, toggle, handler){
            return {
                itemId: id,
                cls: 'x-btn-icon x-edit-'+id,
                enableToggle: toggle !== false,
                scope: editor,
                handler: handler||editor.relayBtnCmd,
                clickEvent: 'mousedown',
                tooltip: editor.buttonTips[id] || undefined,
                tabIndex: -1
            };
        }

        // build the toolbar
        var tb = new Ext.Toolbar({
            renderTo:this.wrap.dom.firstChild
        });

        // stop form submits
        tb.el.on('click', function(e){
            e.preventDefault();
        });

        if(this.enableFont && !Ext.isSafari){
            this.fontSelect = tb.el.createChild({
                tag:'select',
                cls:'x-font-select',
                html: this.createFontOptions()
            });
            this.fontSelect.on('change', function(){
                var font = this.fontSelect.dom.value;
                this.relayCmd('fontname', font);
                this.deferFocus();
            }, this);
            tb.add(
                this.fontSelect.dom,
                '-'
            );
        };

        if(this.enableFormat){
            tb.add(
                btn('bold'),
                btn('italic'),
                btn('underline')
            );
        };

        if(this.enableColors){
            tb.add(
                '-', {
                    itemId:'forecolor',
                    cls:'x-btn-icon x-edit-forecolor',
                    clickEvent:'mousedown',
                    tooltip: editor.buttonTips['forecolor'] || undefined,
                    tabIndex:-1,
                    menu : new Ext.menu.ColorMenu({
                        allowReselect: true,
                        focus: Ext.emptyFn,
                        value:false,
                        plain:true,
                        selectHandler: function(cp, color){
                            this.execCmd('forecolor', Ext.isSafari || Ext.isIE ? '#'+color : color);
                            this.deferFocus();
                        },
                        scope: this,
                        clickEvent:'mousedown'
                    })
                }/*, {
                    itemId:'backcolor',
                    cls:'x-btn-icon x-edit-backcolor',
                    clickEvent:'mousedown',
                    tooltip: editor.buttonTips['backcolor'] || undefined,
                    tabIndex:-1,
                    menu : new Ext.menu.ColorMenu({
                        focus: Ext.emptyFn,
                        value:false,
                        plain:true,
                        allowReselect: true,
                        selectHandler: function(cp, color){
                            this.execCmd('backcolor', color);
                            this.deferFocus();
                        },
                        scope:this,
                        clickEvent:'mousedown'
                    })
                }*/
            );
        };

        if(this.enableAlignments){
            tb.add(
                '-',
                btn('justifyleft'),
                btn('justifycenter'),
                btn('justifyright')
            );
        };

        if(this.enableLinks){
            tb.add(
                '-',
                btn('createlink', false, this.createLink)
            );
        };

        if(this.enableImages){
            tb.add(
                '-',
                btn('createimg', false, this.createImg)
            );
        };

        this.tb = tb;
    },

    // private
    onRender : function(ct, position){
        Ext.ux.BBCodeEditor.superclass.onRender.call(this, ct, position);
        this.el.dom.style.border = '0 none';
        if(Ext.isIE){ // fix IE 1px bogus margin
            this.el.applyStyles('margin-top:-1px;margin-bottom:-1px;')
        }
        this.wrap = this.el.wrap({
            cls:'x-html-editor-wrap', cn:{cls:'x-html-editor-tb'}
        });

        this.createToolbar(this);

        if(!this.width){
            this.setSize(this.el.getSize());
        }
    },

    // NOTE : texteditor height was 0 after upgrade to Ext-2.2.1
    // private
    onResize : function(w, h){
        Ext.form.HtmlEditor.superclass.onResize.apply(this, arguments);
        if(this.el && this.iframe){
            if(typeof w == 'number'){
                var aw = w - this.wrap.getFrameWidth('lr');
                this.el.setWidth(this.adjustWidth('textarea', aw));
                this.iframe.style.width = Math.max(aw, 0) + 'px';
            }
            if(typeof h == 'number'){
                var ah = h - this.wrap.getFrameWidth('tb') - this.tb.el.getHeight();
                this.el.setHeight(this.adjustWidth('textarea', ah));
                this.iframe.style.height = Math.max(ah, 0) + 'px';
                if(this.doc){
                    this.getEditorBody().style.height = Math.max((ah - (this.iframePad*2)), 0) + 'px';
                }
            }
        }
    },

    // private used internally
    createLink : function(){
        //var url = prompt(this.createLinkText, this.defaultLinkValue);
        //if(url && url != 'http:/'+'/'){
        //    this.relayCmd('createlink', url);
        //}
        Ext.Msg.prompt(this.createLinkText,'',function(id, url){
                if(id=='ok' && url && url != 'http:/'+'/'){
                    this.relayCmd('createlink', url);
                }
            },this,false,this.defaultLinkValue);
    },

    createImg : function(){
        Ext.Msg.prompt(this.createImageText,'',function(id, url){
                if(id=='ok' && url && url != 'http:/'+'/'){
                    this.relayCmd('createimg', url);
                }
            },this,false,this.defaultImageValue);
        //var url = prompt(this.createImageText, this.defaultImageValue);
        /*if(url && url != 'http:/'+'/'){
            this.relayCmd('createimg', url);
        }*/
    },

    // private (for BoxComponent)
    adjustSize : Ext.BoxComponent.prototype.adjustSize,

    // private (for BoxComponent)
    getResizeEl : function(){
        return this.wrap;
    },

    // private (for BoxComponent)
    getPositionEl : function(){
        return this.wrap;
    },

    // private
    initEvents : function(){
        this.originalValue = this.getValue();
    },

    /**
     * Overridden and disabled. The editor element does not support standard valid/invalid marking. @hide
     * @method
     */
    markInvalid : Ext.emptyFn,
    /**
     * Overridden and disabled. The editor element does not support standard valid/invalid marking. @hide
     * @method
     */
    clearInvalid : Ext.emptyFn,

    setValue : function(v){
        Ext.ux.BBCodeEditor.superclass.setValue.call(this, v);
    },

    // private
    deferFocus : function(){
        this.focus.defer(10, this);
    },

    // doc'ed in Field
    focus : function(){
        this.el.focus();
    },

    // private
    initEditor : function(){
        this.initialized = true;
        this.fireEvent('initialize', this);
    },

    // private
    onDestroy : function(){
        if(this.rendered){
            this.tb.items.each(function(item){
                if(item.menu){
                    item.menu.removeAll();
                    if(item.menu.el){
                        item.menu.el.destroy();
                    }
                }
                item.destroy();
            });
        }
    },

    // private
    onFirstFocus : function(){
        this.activated = true;
        this.tb.items.each(function(item){
           item.enable();
        });

        this.fireEvent('activate', this);
    },

    onEditorEvent : function(e){
        this.updateToolbar();
    },

    /**
     * Protected method that will not generally be called directly. It triggers
     * a toolbar update by reading the markup state of the current selection in the editor.
     */
    updateToolbar: function(){

        if(!this.activated){
            this.onFirstFocus();
            return;
        }
        Ext.menu.MenuMgr.hideAll();
    },

    // private
    relayBtnCmd : function(btn){
        this.relayCmd(btn.itemId);
    },

    /**
     * Executes a Midas editor command on the editor document and performs necessary focus and
     * toolbar updates. <b>This should only be called after the editor is initialized.</b>
     * @param {String} cmd The Midas command
     * @param {String/Boolean} value (optional) The value to pass to the command (defaults to null)
     */
    relayCmd : function(cmd, value){
        //this.win.focus();
        this.execCmd(cmd, value);
        this.updateToolbar();
        this.deferFocus();
    },

    /**
     * Executes a Midas editor command directly on the editor document.
     * For visual commands, you should use {@link #relayCmd} instead.
     * <b>This should only be called after the editor is initialized.</b>
     * @param {String} cmd The Midas command
     * @param {String/Boolean} value (optional) The value to pass to the command (defaults to null)
     */
    execCmd : function(cmd, value){
    	if(cmd=='bold') {
   			if(!this.replaceSelectedText(this.el.dom, '[b]', '[/b]')) {
	    		if(this.tb.items.get(cmd).pressed) {
    				this.el.dom.value += '[b]';
    			} else {
    				this.el.dom.value += '[/b]';
    			}
   			} else {
   				this.tb.items.get(cmd).toggle(false);
   			}
    	}
    	if(cmd=='italic') {
   			if(!this.replaceSelectedText(this.el.dom, '[i]', '[/i]')) {
	    		if(this.tb.items.get(cmd).pressed) {
    				this.el.dom.value += '[i]';
    			} else {
    				this.el.dom.value += '[/i]';
    			}
   			} else {
   				this.tb.items.get(cmd).toggle(false);
   			}
    	}
    	if(cmd=='underline') {
   			if(!this.replaceSelectedText(this.el.dom, '[u]', '[/u]')) {
	    		if(this.tb.items.get(cmd).pressed) {
    				this.el.dom.value += '[u]';
    			} else {
    				this.el.dom.value += '[/u]';
    			}
   			} else {
   				this.tb.items.get(cmd).toggle(false);
   			}
    	}
    	if(cmd=='forecolor') {
    		if(value !== false) {
    			if(!this.replaceSelectedText(this.el.dom, '[color='+value+']', '[/color]')) {
    				this.el.dom.value += '[color='+value+'][/color]';
    			}
    		}
    	}
    	if(cmd=='backcolor') {
    		if(value !== false) {
    			if(!this.replaceSelectedText(this.el.dom, '[bgcolor='+value+']', '[/bgcolor]')) {
    				this.el.dom.value += '[bgcolor='+value+'][/bgcolor]';
    			}
    		}
    	}
    	if(cmd=='justifyleft') {
   			if(!this.replaceSelectedText(this.el.dom, '[left]', '[/left]')) {
	    		if(this.tb.items.get(cmd).pressed) {
    				this.el.dom.value += '[left]';
    			} else {
    				this.el.dom.value += '[/left]';
    			}
   			} else {
   				this.tb.items.get(cmd).toggle(false);
   			}
    	}
    	if(cmd=='justifycenter') {
   			if(!this.replaceSelectedText(this.el.dom, '[center]', '[/center]')) {
	    		if(this.tb.items.get(cmd).pressed) {
    				this.el.dom.value += '[center]';
    			} else {
    				this.el.dom.value += '[/center]';
    			}
   			} else {
   				this.tb.items.get(cmd).toggle(false);
   			}
   		}
    	if(cmd=='justifyright') {
   			if(!this.replaceSelectedText(this.el.dom, '[right]', '[/right]')) {
	    		if(this.tb.items.get(cmd).pressed) {
    				this.el.dom.value += '[right]';
    			} else {
    				this.el.dom.value += '[/right]';
    			}
   			} else {
   				this.tb.items.get(cmd).toggle(false);
   			}
   		}
    	if(cmd=='createlink') {
    		if(value) {
    			if(!this.replaceSelectedText(this.el.dom, '[url='+value+']', '[/url]')) {
    				this.el.dom.value += '[url='+value+']'+value+'[/url]';
    			}
    		}
    	}
    	if(cmd=='createimg') {
    		if(value) {
    			this.el.dom.value += '[img]'+value+'[/img]';
    		}
    	}
    	if(cmd=='fontname') {
    		if(value) {
    			if(!this.replaceSelectedText(this.el.dom, '[size='+value+']', '[/size]')) {
    				this.el.dom.value += '[size='+value+'][/size]';
    			}
    		}
    	}
    },

    // private
    replaceSelectedText : function (obj, prefix, suffix){
 		obj.focus();
		if (document.selection) {
   			var s = document.selection.createRange();
   			if (s.text) {
     			s.text = prefix + s.text + suffix;
	 			s.select();
	 			return true;
   			}
 		} else if (typeof(obj.selectionStart) == "number") {
   			if (obj.selectionStart!=obj.selectionEnd) {
     			var start = obj.selectionStart;
     			var end = obj.selectionEnd;
				var rs = prefix + obj.value.substr(start,end-start) + suffix;
				obj.value = obj.value.substr(0,start)+rs+obj.value.substr(end);
				obj.setSelectionRange(end,end);
				return true;
   			}
 		}
		return false;
	},

    /**
     * Inserts the passed text at the current cursor position. Note: the editor must be initialized and activated
     * to insert text.
     * @param {String} text
     */
    insertAtCursor : function(text){
        if(!this.activated){
            return;
        }
    },

    /**
     * Returns the editor's toolbar. <b>This is only available after the editor has been rendered.</b>
     * @return {Ext.Toolbar}
     */
    getToolbar : function(){
        return this.tb;
    },

    /**
     * Object collection of toolbar tooltips for the buttons in the editor. The key
     * is the command id associated with that button and the value is a valid QuickTips object.
     * For example:
     * @type Object
     */
    buttonTips : {
        bold : {
            title: 'Bold',
            text: 'Make the selected text bold.',
            cls: 'x-html-editor-tip'
        },
        italic : {
            title: 'Italic',
            text: 'Make the selected text italic.',
            cls: 'x-html-editor-tip'
        },
        underline : {
            title: 'Underline',
            text: 'Underline the selected text.',
            cls: 'x-html-editor-tip'
        },
        backcolor : {
            title: 'Text Highlight Color',
            text: 'Change the background color of the selected text.',
            cls: 'x-html-editor-tip'
        },
        forecolor : {
            title: 'Font Color',
            text: 'Change the color of the selected text.',
            cls: 'x-html-editor-tip'
        },
        justifyleft : {
            title: 'Align Text Left',
            text: 'Align selected text to the left.',
            cls: 'x-html-editor-tip'
        },
        justifycenter : {
            title: 'Center Text',
            text: 'Center selected text.',
            cls: 'x-html-editor-tip'
        },
        justifyright : {
            title: 'Align Text Right',
            text: 'Align selected text to the right.',
            cls: 'x-html-editor-tip'
        },
        createlink : {
            title: 'Hyperlink',
            text: 'Make the selected text a hyperlink.',
            cls: 'x-html-editor-tip'
        },
        createimg : {
            title: 'Image',
            text: 'Insert image',
            cls: 'x-html-editor-tip'
        }
    }
});
Ext.reg('bbcodeeditor', Ext.ux.BBCodeEditor);


//so LovCombo
/**
 * Ext.ux.form.LovCombo, List of Values Combo
 *
 * @author    Ing. Jozef Sak??lo??
 * @copyright (c) 2008, by Ing. Jozef Sak??lo??
 * @date      16. April 2008
 * @version   $Id: Ext.ux.form.LovCombo.js 285 2008-06-06 09:22:20Z jozo $
 *
 * @license Ext.ux.form.LovCombo.js is licensed under the terms of the Open Source
 * LGPL 3.0 license. Commercial use is permitted to the extent that the
 * code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 *
 * License details: http://www.gnu.org/licenses/lgpl.html
 */

/*global Ext */

// add RegExp.escape if it has not been already added
if('function' !== typeof RegExp.escape) {
	RegExp.escape = function(s) {
		if('string' !== typeof s) {
			return s;
		}
		// Note: if pasting from forum, precede ]/\ with backslash manually
		return s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
	}; // eo function escape
}

// create namespace
Ext.ns('Ext.ux.form');


//Ext.ux.TwinCombo = Ext.extend(Ext.form.ComboBox, {
//    initComponent: function() {
//        this.triggerConfig = {
//            tag:'span', cls:'x-form-twin-triggers', cn:[
//            {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.trigger1Class},
//            {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.trigger2Class}
//        ]};
//        this.onTrigger2Click = this.onTrigger2Click.createInterceptor(function() {
//            this.collapse();
//        });
//        Ext.ux.TwinCombo.superclass.initComponent.call(this);
//    },
//    getTrigger: Ext.form.TwinTriggerField.prototype.getTrigger,
//    initTrigger: Ext.form.TwinTriggerField.prototype.initTrigger,
//    onTrigger1Click: Ext.form.ComboBox.prototype.onTriggerClick,
//    trigger1Class: Ext.form.ComboBox.prototype.triggerClass
//});
Ext.override(Ext.form.TriggerField,{
	 twinTrigger: true
	,getTrigger: Ext.form.TwinTriggerField.prototype.getTrigger
	,initTrigger: Ext.form.TwinTriggerField.prototype.initTrigger
	,onTrigger2Click: Ext.form.TriggerField.prototype.onTriggerClick
	,trigger1Class: 'x-form-clear-trigger'
	,trigger2Class: Ext.form.TriggerField.prototype.triggerClass
	,initComponent: Ext.form.TriggerField.prototype.initComponent.createInterceptor(function(){
		if(this.triggerClass) this.trigger2Class = this.triggerClass
		if(typeof this.onTriggerClick == 'function') this.onTrigger2Click = this.onTriggerClick
		this.triggerConfig = {
			tag:'span', cls:'x-form-twin-triggers', cn:[
			{tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.trigger1Class + (!this.twinTrigger?' x-hide-display':'')},
			{tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.trigger2Class}
		]};
		if(typeof this.onTrigger1Click != 'function'){
			this.onTrigger1Click = function(){
				this.setValue('');
				this.focus();
				this.fireEvent('change',this,this.getRawValue(),'')
			}
		}
	})
})
Ext.override(Ext.form.ComboBox,{
	 twinTrigger: true
	,getTrigger: Ext.form.TwinTriggerField.prototype.getTrigger
	,initTrigger: Ext.form.TwinTriggerField.prototype.initTrigger
	,onTrigger2Click: Ext.form.ComboBox.prototype.onTriggerClick
	,trigger1Class: 'x-form-clear-trigger'
	,trigger2Class: Ext.form.ComboBox.prototype.triggerClass
	,initComponent: Ext.form.ComboBox.prototype.initComponent.createInterceptor(function(){
		this.triggerConfig = {
			tag:'span', cls:'x-form-twin-triggers', cn:[
			{tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.trigger1Class + (!this.twinTrigger?' x-hide-display':'')},
			{tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.trigger2Class}
		]};
		if(typeof this.onTrigger1Click != 'function'){
			this.onTrigger1Click = function(){
				this.clearValue();
				this.focus();
				this.fireEvent('change',this,this.getRawValue(),'')
			}
		}
		this.onTrigger1Click = this.onTrigger1Click.createInterceptor(function() {
			this.collapse();
		});
	})
})
//Ext.form.ComboBox.prototype.getTrigger = Ext.form.TwinTriggerField.prototype.getTrigger;
//Ext.form.ComboBox.prototype.initTrigger = Ext.form.TwinTriggerField.prototype.initTrigger;
//Ext.form.ComboBox.prototype.onTrigger2Click = Ext.form.ComboBox.prototype.onTriggerClick
//Ext.form.ComboBox.prototype.trigger1Class = 'x-form-clear-trigger';
//Ext.form.ComboBox.prototype.trigger2Class = Ext.form.ComboBox.prototype.triggerClass;
//Ext.form.ComboBox.prototype.initComponent.createInterceptor(function(){
//	this.triggerConfig = {
//		tag:'span', cls:'x-form-twin-triggers', cn:[
//		{tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.trigger1Class},
//		{tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.trigger2Class}
//	]};
//	if(typeof this.onTrigger1Click != 'function'){
//		this.onTrigger1Click = function(){
//			this.clearValue();
//		}
//	}
//	this.onTrigger1Click = this.onTrigger1Click.createInterceptor(function() {
//		this.collapse();
//	});
//})
/**
 *
 * @class Ext.ux.form.LovCombo
 * @extends Ext.form.ComboBox
 */
Ext.ux.form.LovCombo = Ext.extend(Ext.form.ComboBox, {

	// {{{
    // configuration options
	/**
	 * @cfg {String} checkField name of field used to store checked state.
	 * It is automatically added to existing fields.
	 * Change it only if it collides with your normal field.
	 */
	 checkField:'checked'

	/**
	 * @cfg {String} separator separator to use between values and texts
	 */
    ,separator:','

	/**
	 * @cfg {String/Array} tpl Template for items.
	 * Change it only if you know what you are doing.
	 */
	// }}}
    // {{{
	//,getTrigger: Ext.form.TwinTriggerField.prototype.getTrigger
	//,initTrigger: Ext.form.TwinTriggerField.prototype.initTrigger
	//,onTrigger2Click: Ext.form.ComboBox.prototype.onTriggerClick
	//,trigger1Class: 'x-form-clear-trigger'
	//,trigger2Class: Ext.form.ComboBox.prototype.triggerClass
    ,initComponent:function() {

		// template with checkbox
		if(!this.tpl) {
			this.tpl =
				 '<tpl for=".">'
				+'<div class="x-combo-list-item">'
				+'<img src="' + Ext.BLANK_IMAGE_URL + '" '
				+'class="ux-lovcombo-icon ux-lovcombo-icon-'
				+'{[values.' + this.checkField + '?"checked":"unchecked"' + ']}">'
				+'<div class="ux-lovcombo-item-text">{' + (this.displayField || 'text' )+ '}</div>'
				+'</div>'
				+'</tpl>'
			;
		}

		//this.triggerConfig = {
		//	tag:'span', cls:'x-form-twin-triggers', cn:[
		//	{tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.trigger1Class},
		//	{tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.trigger2Class}
		//]};
		//if(typeof this.onTrigger1Click != 'function'){
		//	this.onTrigger1Click = function(){
		//		this.clearValue();
		//	}
		//}
		//this.onTrigger1Click = this.onTrigger1Click.createInterceptor(function() {
		//	this.collapse();
		//});


        // call parent
        Ext.ux.form.LovCombo.superclass.initComponent.apply(this, arguments);

		// install internal event handlers
		this.on({
			 scope:this
			,beforequery:this.onBeforeQuery
			,blur:this.onRealBlur
		});

		// remove selection from input field
		this.onLoad = this.onLoad.createSequence(function() {
			if(this.el) {
				var v = this.el.dom.value;
				this.el.dom.value = '';
				this.el.dom.value = v;
			}
		});

    } // e/o function initComponent
    // }}}
	// {{{
	/**
	 * Disables default tab key bahavior
	 * @private
	 */
	,initEvents:function() {
		Ext.ux.form.LovCombo.superclass.initEvents.apply(this, arguments);

		// disable default tab handling - does no good
		this.keyNav.tab = false;

	} // eo function initEvents
	// }}}
	// {{{
	/**
	 * clears value
	 */
	,clearValue:function() {
		this.value = '';
		this.setRawValue(this.value);
		this.store.clearFilter();
		this.store.each(function(r) {
			r.set(this.checkField, false);
		}, this);
		if(this.hiddenField) {
			this.hiddenField.value = '';
		}
		this.applyEmptyText();
	} // eo function clearValue
	// }}}
	// {{{
	/**
	 * @return {String} separator (plus space) separated list of selected displayFields
	 * @private
	 */
	,getCheckedDisplay:function() {
		var re = new RegExp(this.separator, "g");
		return this.getCheckedValue(this.displayField).replace(re, this.separator);
	} // eo function getCheckedDisplay
	// }}}
	// {{{
	/**
	 * @return {String} separator separated list of selected valueFields
	 * @private
	 */
	,getCheckedValue:function(field) {
		field = field || this.valueField;
		var c = [];

		// store may be filtered so get all records
		var snapshot = this.store.snapshot || this.store.data;

		snapshot.each(function(r) {
			if(r.get(this.checkField)) {
				c.push(r.get(field));
			}
		}, this);

		return c.join(this.separator);
	} // eo function getCheckedValue
	// }}}
	// {{{
	/**
	 * beforequery event handler - handles multiple selections
	 * @param {Object} qe query event
	 * @private
	 */
	,onBeforeQuery:function(qe) {
		qe.query = qe.query.replace(new RegExp(this.getCheckedDisplay() + '[ ' + this.separator + ']*'), '');
	} // eo function onBeforeQuery
	// }}}
	// {{{
	/**
	 * blur event handler - runs only when real blur event is fired
	 */
	,onRealBlur:function() {
		this.list.hide();
		var rv = this.getRawValue();
		var rva = rv.split(new RegExp(RegExp.escape(this.separator) + ' *'));
		var va = [];
		var snapshot = this.store.snapshot || this.store.data;

		// iterate through raw values and records and check/uncheck items
		Ext.each(rva, function(v) {
			snapshot.each(function(r) {
				if(v === r.get(this.displayField)) {
					va.push(r.get(this.valueField));
				}
			}, this);
		}, this);
		if(va.length){
			this.setValue(va.join(this.separator));
		}else{
			this.setValue(rv);
		}
		this.store.clearFilter();
	} // eo function onRealBlur
	// }}}
	// {{{
	/**
	 * Combo's onSelect override
	 * @private
	 * @param {Ext.data.Record} record record that has been selected in the list
	 * @param {Number} index index of selected (clicked) record
	 */
	,onSelect:function(record, index) {
        if(this.fireEvent('beforeselect', this, record, index) !== false){

			// toggle checked field
			record.set(this.checkField, !record.get(this.checkField));

			// display full list
			if(this.store.isFiltered()) {
				this.doQuery(this.allQuery);
			}

			// set (update) value and fire event
			this.setValue(this.getCheckedValue());
            this.fireEvent('select', this, record, index);
        }
	} // eo function onSelect
	// }}}
	// {{{

	/**
	 * Sets the value of the LovCombo
	 * @param {Mixed} v value
	 */
	,setValue:function(v) {
		if(v) {
			v = '' + v;
			if(this.valueField) {
				this.store.clearFilter();
				this.store.each(function(r) {
					var checked = !(!v.match(
						 '(^|' + this.separator + ')' + RegExp.escape(r.get(this.valueField))
						+'(' + this.separator + '|$)'))
					;

					r.set(this.checkField, checked);
				}, this);
				if(this.getCheckedValue()){
					this.value = this.getCheckedValue();
				}else{
					this.value = v;
				}
				if(this.getCheckedDisplay()){
					this.setRawValue(this.getCheckedDisplay());
				}
				else{
					this.setRawValue(v);
				}
				if(this.hiddenField) {
					this.hiddenField.value = this.value;
				}
			}
			else {
				this.value = v;
				this.setRawValue(v);
				if(this.hiddenField) {
					this.hiddenField.value = v;
				}
			}
			if(this.el) {
				this.el.removeClass(this.emptyClass);
			}
		}
		else {
			this.clearValue();
		}
	} // eo function setValue
	// }}}
	// {{{
	/**
	 * Selects all items
	 */
	,selectAll:function() {
        this.store.each(function(record){
            // toggle checked field
            record.set(this.checkField, true);
        }, this);

        //display full list
        this.doQuery(this.allQuery);
        this.setValue(this.getCheckedValue());
    } // eo full selectAll
	// }}}
	// {{{
	/**
	 * Deselects all items. Synonym for clearValue
	 */
    ,deselectAll:function() {
		this.clearValue();
    } // eo full deselectAll
	// }}}

}); // eo extend

// register xtype
Ext.reg('lovcombo', Ext.ux.form.LovCombo);
 //eo LovCombo

Ext.ux.form.SearchField = Ext.extend(Ext.form.ComboBox, {
    initComponent : function(){
        Ext.ux.form.SearchField.superclass.initComponent.call(this);
        this.on('specialkey', function(f, e){
			//debug.log('special pressed',e.getKey());
            if(e.getKey() == e.ENTER){
				//this.keyNav.down.call(this);
				if(!this.isExpanded()){
                    this.onTriggerClick();
                }
                //this.onTrigger2Click();
            }
        }, this);
		this.triggerConfig = {
			tag:'span', cls:'x-form-twin-triggers', cn:[
			{tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + 'x-form-clear-trigger'},
			{tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + 'x-form-search-trigger'}
		]};
    },
	//onViewClick : function(doFocus){
	//	if(!this.isExpanded()){
	//		this.onTriggerClick();
	//	}else{
	//		var index = this.view.getSelectedIndexes()[0];
	//		var r = this.store.getAt(index);
	//		if(r){
	//			this.onSelect(r, index);
	//		}
	//		if(doFocus !== false){
	//			this.el.focus();
	//		}
	//	}
	//},
    validationEvent:false,
    validateOnBlur:false,
    trigger1Class:'x-form-clear-trigger',
    trigger2Class:'x-form-search-trigger',
    hideTrigger1:true,
    width:180,
    hasSearch : false,
    paramName : 'query',

    onTrigger1Click : function(){
        if(this.hasSearch){
            this.el.dom.value = '';
            var o = {start: 0};
            this.store.baseParams = this.store.baseParams || {};
            this.store.baseParams[this.paramName] = '';
            this.store.reload({params:o});
            this.triggers[0].hide();
            this.hasSearch = false;
        }
    },

    onTrigger2Click : function(){
        var v = this.getRawValue();
        if(v.length < 1){
            this.onTrigger1Click();
            return;
        }
        var o = {start: 0};
        this.store.baseParams = this.store.baseParams || {};
        this.store.baseParams[this.paramName] = v;
        this.store.reload({params:o});
        this.hasSearch = true;
        this.triggers[0].show();
    }
});
Ext.reg('searchfield', Ext.ux.form.SearchField);



// Ext.ux.TinyMCE missing functions

//Ext.override(Ext.ux.TinyMCE, {
//		/** ----------------------------------------------------------
//		*/
//		getRawValue : function(){
//
//			if( !this.rendered || !this.ed.initialized )
//				return this.value;
//
//			var v = this.ed.getContent();
//			if( v === this.emptyText || v === undefined ){
//				v = '';
//			}
//			return v;
//		},
//
//		/** ----------------------------------------------------------
//		*/
//		setRawValue : function( v ){
//			this.value = v;
//			if( this.rendered )
//				this.withEd( function(){
//					this.ed.undoManager.clear();
//					this.ed.setContent( v === null || v === undefined ? '' : v );
//					this.ed.startContent = this.ed.getContent({ format : 'raw' });
//					//this.validate();
//				});
//		}
//});

Ext.ux.form.SimpleEditor = Ext.extend(Ext.form.HtmlEditor, {
    initEditor: Ext.form.HtmlEditor.prototype.initEditor.createSequence(function(){
	//initEditor : function(){
		Ext.ux.form.SimpleEditor.superclass.constructor.call( this );
        //Ext.DomHelper.applyStyles(Ext.getCmp('dl-links-1').getEditorBody(), {'white-space':'nowrap'})
        Ext.DomHelper.applyStyles(this.getEditorBody(), {'white-space':'nowrap','font-size':'11px !important'});
		//Ext.DomHelper.applyStyles(this.getEditorBody(), this.el.dom.style.cssText);

    }),
	getDocMarkup : function(){
        return '<html><head><style type="text/css">body{white-space:nowrap;font-size:11px !important;border:0;margin:0;padding:3px;height:98%;cursor:text;white-space:nowrap;font-size:11px !important;}</style></head><body></body></html>';
    },
	onRender: Ext.form.HtmlEditor.prototype.onRender.createSequence(function(){
		//this.el.parent().down('.x-html-editor-tb').remove();
		this.getToolbar().getEl().remove();
	}),
//	insertAtCursor : function(text){
//        if(!this.activated){
//            return;
//        }
//        this.win.focus();
//        this.execCmd('InsertText', text);
//        this.deferFocus();
//    },
	pushValue : function(){
        if(this.initialized){
            var v = this.el.dom.value;
            if(!this.activated && v.length < 1){
                v = '&nbsp;';
            }
            if(this.fireEvent('beforepush', this, v) !== false){
                this.getEditorBody().innerHTML = '<div style="white-space:nowrap;font-size:11px !important">'+v+'</div>';
                this.fireEvent('push', this, v);
            }
        }
    },
	applyCommand: Ext.emptyFn
});
Ext.reg('simpleeditor', Ext.ux.form.SimpleEditor);
