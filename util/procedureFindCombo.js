/**
 * @class Application.components.procedureFindCombo
 * @extends Ext.form.field.ComboBox
 *
 * Строка для быстрого поиска процедуры по её реестровому номеру.
 * По принципу автодополнения вываливает список найденных
 * процедур по первым символам номера.
 *
 */
Ext.define('Application.components.procedureFindCombo', {
  extend        : 'Ext.form.ComboBox',

  fieldLabel    : 'Номер процедуры',

  typeAhead     : false,
  hideTrigger   : true,
  selectOnFocus : true,

  allowBlank    : true,

  minChars      : 1,
  mode          : 'remote',

  displayField  : 'summary',
  valueField    : 'id',
  hiddenName    : 'procedure',

  listEmptyText : 'Нет подходящих процедур',
  tpl           : '<tpl for="."><div class="search-item {[xindex % 2 === 0 ? "x-even" : "x-odd"]}">'+
                    '{text}'+
                  '</div></tpl>',
  itemSelector  : 'div.search-item',

  store         : null,
  storeBaseParams: {},

  initComponent : function() {

    if ( Ext.isEmpty(this.name) )
      this.name = 'procedure';

    this.hiddenName = this.name;

    if (this.store === null)
      this.store = createProcedureShortListStore(this.storeBaseParams);

    if (Ext.isString(this.tpl)) {
      this.tpl = new Ext.XTemplate(this.tpl.replace('{text}', '{'+this.displayField+'}'));
    }

    /*this.listeners = {
      select: function(combo, record) {
        //console.debug( record.get('id') );
      }
    }*/

    Application.components.procedureFindCombo.superclass.initComponent.call(this);
  } // initComponent

}); // Application.components.procedureFindCombo