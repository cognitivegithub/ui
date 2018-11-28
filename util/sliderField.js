/**
 * Параметры:
 *   minValue
 *   maxValue
 *   numberParams
 *   sliderParams
 *
 * Евенты:
 *   нет
 */

Ext.define('Application.components.sliderField', {
  extend: 'Ext.form.CompositeField',
  minValue: 0,
  maxValue: 1000,
  numberParams: {},
  sliderParams: {},
  initComponent: function() {
    this.ids = {
      slider: Ext.id(),
      number: Ext.id()
    };
    var number = Ext.apply({
      xtype: 'numberfield',
      msgTarget: 'qtip',
      decimalPrecision: 2,
      allowNegative: false
    }, this.numberParams);
    Ext.apply(number, {
      id: this.ids.number,
      hideLabel: true,
      flex: 3,
      minValue: this.minValue,
      maxValue: this.maxValue
    });

    var slider = Ext.apply({
      xtype: 'slider',
      flex: 4,
      decimalPrecision: 1,
      increment: 0.5,
      plugins: new Ext.slider.Tip({
        getText: function(thumb) {
          return thumb.value + ' %';
        }
      })
    }, this.sliderParams);
    Ext.apply(slider, {
      id: this.ids.slider,
      hideLabel: true
    });

   /* var sliderPanel =Ext.apply({
      xtype: 'panel',
      layout: 'vbox',
      autoHeight: true,
      items: [
        slider,
        {
          xtype: 'panel',
          layout: 'hbox',
          height: 15,
          layoutConfig: {
            padding:'5',
            align:'top'
          },
          items: [
            {
              html: '0%',
              width: 15,
              border: false
            },
            {
              xtype:'spacer',
              flex:1
            },{
              html: '100%',
              width: 25,
              border: false
            }
          ]

        }
      ]
    });*/

    this.addEvents('sync');
    Ext.apply(this, {
      items: [
        number,
        {
          xtype: 'displayfield',
          value: '0%',
          style: 'text-align: right',
          flex: 1
        },
        slider,
      {
        xtype: 'displayfield',
        value: '100%',
        flex: 1,
        style: 'margin-right: 5px'
      }],
      enableAnimation: true,
      cls: 'cleanbackground',
      msgTarget: 'qtip'
    });

    Application.components.sliderField.superclass.initComponent.call(this);
    //this.on('beforerender', this.setupEvents, this, {once: true});
    this.setupEvents();
  },
  getValue: function() {
    return Ext.getCmp(this.ids.number).getValue();
  },
  setValue: function(value) {
    return Ext.getCmp(this.ids.number).setValue(value);
  },
  updateRanges: function(min, max) {
    var n = Ext.getCmp(this.ids.number);
    min = min||0;
    max = max||0;
    this.minValue = min;
    this.maxValue = max;
    n.minValue = min;
    n.maxValue = max;
    this.enableAnimation = false;
    n.fireEvent('change', n, n.getValue());
    this.enableAnimation = true;
    n.isValid();
    this.getSlider().syncThumb();
  },
  setupEvents: function(){
    Ext.getCmp(this.ids.number).on('change', function(el, value) {
      if (this.maxValue == this.minValue) {
        return;
      }
      var slider = Ext.getCmp(this.ids.slider);
      var position = 0;
      value = el.getValue();
      if (Ext.isNumber(value)) {
        position = 100*(value - this.minValue)/(this.maxValue - this.minValue);
      }
      this.fixedNumber = true;
      slider.setValue(position, this.enableAnimation);
      this.fixedNumber = false;
    }, this);

    Ext.getCmp(this.ids.slider).on('change', function(el, position) {
      if (this.fixedNumber || this.maxValue == this.minValue) {
        return;
      }
      var value = this.minValue + (position/100)*(this.maxValue - this.minValue);
      Ext.getCmp(this.ids.number).setValue(value);
    }, this);

    this.on('sync', function() {
      var s = Ext.getCmp(this.ids.slider);
      s.syncThumb();
    }, this);
  },
  getSlider: function() {
    return Ext.getCmp(this.ids.slider);
  },
  disable: function() {
    Application.components.sliderField.superclass.disable.call(this);
    this.getSlider().disable();
  },
  enable: function() {
    Application.components.sliderField.superclass.enable.call(this);
    this.getSlider().enable();
  }
});
