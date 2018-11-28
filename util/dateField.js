
/**
 * Поле формы для выбора даты с возможностью дизаблить все, кроме указанного диапазона
 * Задизабленные даты не селектятся
 *
 * Опции:
 *   rangeStart: первая доступная к выбору дата
 *
 *   rangeEnd: последняя доступная к выбору дата. Если не передана или null, а также если отключен
 *   дизаблинг дат в конфиге системы, то выбор по максимальной дате диапазона не ограничивается
 *
 */

Ext.define('Application.components.dateField', {
    extend: 'Ext.form.DateField',
    enableDateRange : function(rangeStart, rangeEnd) {
      if(!rangeStart || rangeStart==null) {
        rangeStart = new Date();
      }
      this.setMinValue(rangeStart);
      if (Main.config.date_disabling && rangeEnd && rangeEnd!=null ) {
        this.setMaxValue(rangeEnd);
      }
    },
    makeDateDisabling : function(dt, fld, settings) {
      if (!settings) {
        return;
      }
      var basic_dt = new Date();
      if(dt) {
        basic_dt = parseDate(dt);
      }
      var minValue;
      if (Main.config.allow_same_date_enabling) {
        minValue = basic_dt;
      } else {
        minValue = basic_dt.add(Date.DAY, 1);
      }
      var maxValue = null;
      if(settings[fld+'_from'] && settings[fld+'_from']!='' && Main.config.date_disabling) {
       minValue = basic_dt.add(Date.DAY, 1+settings[fld+'_from']);
      }
      if(settings[fld+'_to'] &&settings[fld+'_to']!='' && Main.config.date_disabling) {
        maxValue = basic_dt.add(Date.DAY, 1+settings[fld+'_to']);
      }
      this.enableDateRange(minValue, maxValue);
    },
    setValue: function(date) {
      if (!Ext.isDate(date)) {
        date = parseDate(date)||date;
      }
      Application.components.dateField.superclass.setValue.call(this, date);
    }
});
