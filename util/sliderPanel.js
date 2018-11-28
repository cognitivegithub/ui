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

Ext.define('Application.components.sliderPanel', {
  extend: 'Ext.Panel',
  numberParams: {},
  sliderParams: {},
  minValue: 1,
  maxValue: 1000,
  
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
      id: this.ids.number
    });

    var slider = Ext.apply({
      xtype: 'slider',
      flex: 1,
      decimalPrecision: 1,
      increment: this.minIncrement||0.5,
      anchor: false,
      plugins: new Ext.slider.Tip({
        getText: function(thumb) {
          return thumb.value + ' %';
        }
      })
    }, this.sliderParams);
    
    Ext.apply(slider, {
      id: this.ids.slider,
      hideLabel: true,
      width: 300
    });
    
    var sliderCmp = new Ext.form.CompositeField({
      fieldLabel: this.sliderParams.fieldLabel,
      width: this.sliderParams.width,
      items: [
      {
        xtype: 'displayfield',
        value: this.leftTextValue||'0%',
        style: 'text-align: right'
      },
      slider,
      {
        xtype: 'displayfield',
        value: this.rightTextValue||'100%',
        style: 'margin-right: 5px'
      }
      ]});

    this.addEvents('sync');
    Ext.apply(this, {
      hideTitle:true,
      //border: false,
      layout: 'vbox',
      height: 60,
      defaults: {
        layout: 'form',
        labelWidth: 300,
        defaults: {
          anchor: '100%'
        }
      },
      items: [
        {
         items: [number]
        }, {
         items: [sliderCmp]
        }
      ],
      enableAnimation: true,
      cls: 'cleanbackground',
      msgTarget: 'qtip'
    });

    Application.components.sliderPanel.superclass.initComponent.call(this);
    this.setupEvents();
    
  },
  getValue: function() {
    return Ext.getCmp(this.ids.slider).getValue();
  },
  setValue: function(value) {
    if(value && !Ext.isEmpty(value))
      this.enable();
    value = parseFloat(value);
    if (this.basicField) {
      Ext.getCmp(this.ids.slider).setValue(value, this.enableAnimation);
      var basicFieldValue = Ext.getCmp(this.basicField).getValue();
      value = basicFieldValue*value/100;
    }
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
    if(n.getValue()>0)
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
      if (Ext.isNumber(value) && !this.basicField) {
        position = 100*(value - this.minValue)/(this.maxValue - this.minValue);
      } else {
        var basicFieldValue = parsePrice(Ext.getCmp(this.basicField).getValue());
        position = value/basicFieldValue*100;
        //position = 100*(value - this.minValue)/(this.maxValue - this.minValue);
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
      if(this.basicField) {
        var basicFieldValue = Ext.getCmp(this.basicField).getValue();
        value = basicFieldValue*value/1000;
      }
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
    Application.components.sliderPanel.superclass.disable.call(this);
    this.getSlider().disable();
  },
  enable: function() {
    Application.components.sliderPanel.superclass.enable.call(this);
    this.getSlider().enable();
  }
});
