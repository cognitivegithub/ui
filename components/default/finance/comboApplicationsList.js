/**
 * @class Application.components.comboApplicationsList
 * @extends Ext.form.field.ComboBox
 *
 *
 * Комбо для выбора пары процедура-лот, привязанных к заявкам
 * определённого контрагента (contragent_id).
 *
 */
Ext.define('Application.components.comboApplicationsList', {
  extend        : 'Ext.form.ComboBox',

  fieldLabel    : 'Реестровый номер процедуры и&nbsp;лот заявки',

  autoScroll    : true,
  editable      : true,
  allowBlank    : false,
  autoSelect    : false,
  clearFilterOnReset : true,
  forceSelection : true,
  typeAhead     : true,
  minChars      : 5,
  triggerAction: 'all',

  lazyInit      : false,

  mode          : 'local',

  displayField  : 'text',
  valueField    : 'id',
  hiddenName    : 'application',

  store         : null,
  supplier      : null,

  initComponent: function() {

    if (this.store === null)
      this.store = createContragentApplicationsListStore(this.supplier);


    Application.components.comboApplicationsList.superclass.initComponent.call(this);
  } // initComponent

}); // Application.components.procedureFindCombo