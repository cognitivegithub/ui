/**
 * Поля формы для ввода даты и времени
 */

Ext.define('Application.components.datetimeField', {
  extend: 'Ext.form.CompositeField',
  cmp_id: Ext.id(),
  initComponent : function () {
    this.items = [
      { xtype: 'Application.components.dateField',
        altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i',
        id: this.cmp_id + '_date',
        format: 'd.m.Y',
        width: 90
      }
    , { html: '&nbsp',
        // Костыль для IE.
        width: 10
      }
    , { xtype: 'timefield',
        id: this.cmp_id + '_time',
        format: 'H:i',
        width: 60
       }
     ];
    this.getValue = function() {
      var v = null;
      var date_value = Ext.getCmp(this.cmp_id + '_date').getValue();
      if (date_value) {
        var time_value = Ext.getCmp(this.cmp_id + '_time').getValue();
        var date_obj = parseDate(date_value);
        if(time_value && !Ext.isEmpty(time_value)) {
          var time = time_value.split(':');
          date_obj.setHours(time[0]);
          date_obj.setMinutes(time[1]);
        } else {
          date_obj.setHours(0);
          date_obj.setMinutes(0);
        }
        date_obj.setSeconds(0);
        date_obj.setMilliseconds(0);
        var v = date_obj.format('c');
      }
      return v;
    };
    this.setValue = function(v) {
      var dt = parseDate(v);
      Ext.getCmp(this.cmp_id + '_date').setValue(dt);
      Ext.getCmp(this.cmp_id + '_time').setValue(dt);
    };
    Application.components.datetimeField.superclass.initComponent.call(this);
  }

});

