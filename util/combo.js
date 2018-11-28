
/**
 * Комба с возможностью отключать определенные элементы и кастомного рендерера списка.
 * Отключенные элементы не селектятся, и им присваивается дополнительный CSS класс
 *
 * Опции:
 *   disabledField: поле store, которое определяет отключенность записи,
 *   по умолчанию пусто. Если не указать, то поведение идентично обычной комбе.
 *
 *   hiddenRecordField: поле store, которое определяет спрятанность записи,
 *   по умолчанию пусто. Если не указать, то поведение идентично обычной комбе.
 *
 *   renderer: функция рендеринга строчки списка, получает один параметр — данные рекорда
 *
 *   disabledCssClass: класс, присваевымый отключенным записям.
 *   По умолчанию x-combo-list-item-unsel
 *
 */

Application.components.combo = Ext.extend(Ext.form.ComboBox, {
  disabledCssClass: 'x-combo-list-item-unsel',
  hiddenCssClass: 'x-hidden',
  tooltipTpl: false,
  initComponent: function() {
    var disabled_tpl = '', hidden_tpl = '';
    var display_tpl = this.displayField;
    var tpl_params = {compiled: true};
    if (this.disabledField) {
      disabled_tpl = '<tpl if="'+this.disabledField+'"> '+this.disabledCssClass+'</tpl>';
    }
    if (this.hiddenRecordField) {
      hidden_tpl = '<tpl if="'+this.hiddenRecordField+'"> '+this.hiddenCssClass+'</tpl>';
    }
    if (this.renderer) {
      display_tpl = '[this.rendererFn(values)]';
      tpl_params.rendererFn = this.renderer;
    }
    var tip = ' ';
    if (this.tooltipTpl) {
      tip += 'ext:qtip="' + this.tooltipTpl + '" ';
    }
    this.tpl = new Ext.XTemplate(
               '<tpl for=".">'+
                 '<div' + tip + 'class="x-combo-list-item'+disabled_tpl+hidden_tpl+'">'+
                   '{' + display_tpl + '}</div>'+
               '</tpl>', tpl_params);
    Application.components.combo.superclass.initComponent.call(this);
    if (this.disabledField) {
      this.on('beforeselect', function(combo, record) {
        if (record.data[combo.disabledField]) {
          return false;
        }
        return true;
      });
    }
    if (this.hiddenRecordField) {
      this.on('beforeselect', function(combo, record) {
        if (record.data[combo.hiddenRecordField]) {
          return false;
        }
        return true;
      });
    }
  }
});
