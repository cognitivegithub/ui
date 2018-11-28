

Ext.define('Application.components.percentSlider', {
  extend: 'Ext.form.CompositeField',
  minValue: 0,
  maxValue: 100,
  decimalPrecision: 1,
  increment: 0.5,
  numberField: false,
  initComponent: function() {
    this.slider_id = Ext.id();


    var cmp = this;
    var items = [{
        xtype: 'displayfield',
        value: this.leftTextValue||this.minValue+'%',
        flex: 1,
        style: 'text-align: right'
      }, {
        xtype: 'slider',
        id: this.slider_id,
        flex: 4,
        decimalPrecision: this.decimalPrecision,
        increment: this.minIncrement||this.increment,
        disabled: this.disabled,
        value: this.value,
        minValue: this.minValue,
        maxValue: this.maxValue,
        plugins: new Ext.slider.Tip({
          getText: function(thumb) {
            return thumb.value + '%';
          }
        })
      }, {
        xtype: 'displayfield',
        value: this.rightTextValue||this.maxValue+'%',
        flex: 1,
        style: 'margin-right: 5px'
      }];


    if (this.numberField) {
      if (true===this.numberField) {
        this.numberField = {};
      }
      this.number_id = Ext.id();
      items.unshift(Ext.apply({
        xtype: 'Application.components.percentField',
        msgTarget: 'qtip',
        allowNegative: false,
        hideLabel: true,
        flex: 3,
        id: this.number_id,
        minValue: this.minValue,
        value: this.value||0,
        maxValue: this.maxValue
      }, this.numberField));
    }

    Ext.apply(this, {
      items: items,
      enableAnimation: true,
      cls: 'cleanbackground',
      msgTarget: 'qtip'
    });
    Application.components.percentSlider.superclass.initComponent.call(this);
    if (this.numberField) {
      //this.on('beforerender', this.setupEvents, this, {once: true});
      this.setupEvents();
    }
  },
  getValue: function() {
    return Ext.getCmp(this.slider_id).getValue();
  },
  setValue: function(value) {
    value = Number(value);
    if (this.numberField) {
      return Ext.getCmp(this.number_id).setValue(value);
    }
    return Ext.getCmp(this.slider_id).setValue(value);
  },
  updateRanges: Ext.emptyFn,
  setupEvents: function(){
    Ext.getCmp(this.number_id).on('change', function(el, value) {
      var slider = Ext.getCmp(this.slider_id);
      value = Number(el.getValue());
      this.fixedNumber = true;
      slider.setValue(value, this.enableAnimation);
      this.fixedNumber = false;
    }, this);

    Ext.getCmp(this.slider_id).on('change', function(el, position) {
      if (this.fixedNumber) {
        return;
      }
      Ext.getCmp(this.number_id).setValue(position);
    }, this);

    this.on('sync', function() {
      var s = Ext.getCmp(this.slider_id);
      s.syncThumb();
    }, this);
  },
  getSlider: function() {
    return Ext.getCmp(this.slider_id);
  },
  disable: function() {
    Application.components.percentSlider.superclass.disable.call(this);
    this.getSlider().disable();
  },
  enable: function() {
    Application.components.percentSlider.superclass.enable.call(this);
    this.getSlider().enable();
  }
});
