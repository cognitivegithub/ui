/**
 * 
 * Плагин, добавляющий подсказки к любому компоненту (поле формы, ячейка грида, панель и т.п.)
 * 
 * @namespace   Ext.ux.plugins
 * @class       Ext.ux.plugins.ToolTip
 * @use         Ext.ToolTip
 * 
 * @usage     {
 *                xtype: 'textfield',
 *                fieldLabel: 'My name',
 *                name: 'username',
 *                qtipConfig: {
 *                  autoHide: true,
 *                  closable: false,
 *                  draggable: true,
 *                  applyTipTo: 'label',
 *                  anchor: 'left',
 *                  title: 'Username here',
 *                  html: 'Enter username here& HTML tags are supported, so do things beautifully'
 *                },
 *                plugins: [new Ext.ux.plugins.ToolTip]
 *              }
 *      
 * qtipConfig поддерживает все свойства Ext.ToolTip (включая загрузку содержимого подсказки ajaxом)
 *            плюс есть еще одно свойство:
 *  applyTipTo - 'field' (по умолчанию) - сам элемент, при наведении указателя на котороый будет 
 *                                        отображена подсказка, 
 *               'label' - если элемент является полем формы, то можно отображать подсказку при наведении
 *                         указателя на специальный значок, появляющийся рядом с названием поля формы 
 *                         (fieldLabel) и не показывать подсказку при наведении указателя на само поле
 *               'both' - подсказка показывается в обоих случаях
 */
Ext.ns('Ext.ux.plugins');

//Ext.QuickTips.init();

Ext.ux.plugins.ToolTip = {
  init : function(field) {

    var getTipCfg = function(tipTarget, tipCfg) {
      var cfg = tipCfg||{};
      cfg.autoHeight=true;
      cfg.target = tipTarget;
      cfg.enabled = true;
      if(!cfg.applyTipTo) {
        cfg.applyTipTo = 'field';
      }
      if(cfg.applyTipTo=='label') {
        cfg.anchor="right";
      }
      return cfg;
    }

    var findLabel = function() {
      var wrapDiv = null;
      var label = null
      //find form-element and label?
      wrapDiv = this.getEl().up('div.x-form-element');
      if (wrapDiv)
      {
          label = wrapDiv.child('label');
      }
      if (label) {
          return label;
      }

      //find form-item and label
      wrapDiv = this.getEl().up('div.x-form-item');
      if (wrapDiv)
      {
          label = wrapDiv.child('label');
      }
      if (label) {
          return label;
      }
      return null;
    };
    
    var getLabelTipObject = function(field) {
      var label = findLabel.call(field);
      if (label){
        var helpImage = label.createChild({
             			tag: 'img', 
             			src: '/ico/help.png',
             			style: 'margin-bottom: 0px; margin-left: 5px; padding: 0px;',
             			width: 14
             		});
        new Ext.ToolTip(getTipCfg(helpImage, field.qtipConfig));
      }
    };

    field.on('afterrender', function() {
      if (this.qtipConfig){
        switch(this.qtipConfig.applyTipTo) {
          case 'field':
            new Ext.ToolTip(getTipCfg(this.getEl(), this.qtipConfig));
            break;
          case 'label':
            getLabelTipObject(this);
            break;
          default:
            new Ext.ToolTip(getTipCfg(this.getEl(), this.qtipConfig));
            getLabelTipObject(this);
            break;
        }
      }
    });
  }
};





