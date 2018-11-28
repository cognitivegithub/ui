
Ext.define('Application.components.autocompleteField', {
  extend: 'Ext.form.ComboBox',
  hideTrigger: true,
  emptyText: '',
  directFn: false,
  minChars: 3,
  storeNameField: 'name',
  storeValueField: 'value',
  storeDisplayField: false,
  storeDisplayFieldConvert: false, //функция для формирования отображаемого поля
  loadRecordById: false, // Передавать дополнительный флаг в запрос при начальной загрузке данных.
  listTpl: false, //шаблон для элементов списка
  storeFields: false, //Дополнительные поля для загрузки в store, например, для шаблона
  storeRoot: false,
  initComponent: function() {
    var storeDisplayField;
    if (this.storeDisplayField !== false) {
      if (false === this.storeDisplayFieldConvert) {
        storeDisplayField = this.storeDisplayField;
      } else {
        storeDisplayField = {name: this.storeDisplayField, convert: this.storeDisplayFieldConvert}; 
      }
    }
    var fields = ['id', this.storeNameField, this.storeValueField];
    if (this.storeFields) {
      fields = fields.concat(this.storeFields);
    }
    if (storeDisplayField) {
      fields.push(storeDisplayField);
    }
    var store = new Ext.data.DirectStore({
      autoDestroy: true,
      directFn: this.directFn||RPC.Reference.okvedSearch,
      totalProperty: 'totalCount',
      root: this.storeRoot||this.storeValueField,
      remoteSort: true,
      autoLoad: false,
      idProperty: 'id',
      fields: fields,
      baseParams: {
        plain: true
      }
    });
    Ext.apply(this, {
      store: store,
      valueField: this.storeValueField,
      displayField: (this.storeDisplayField != false) ? this.storeDisplayField : this.storeValueField,
      mode: 'remote',
      forceSelection: true,
      itemSelector: 'div.search-item',
      tpl: this.listTpl ? this.listTpl : new Ext.XTemplate(
        '<tpl for=".">'+
          '<div class="search-item {[xindex % 2 === 0 ? "x-even" : "x-odd"]}">'+
            '<b>{values.'+this.storeValueField+'}</b> {values.'+this.storeNameField+'}</div>'+
        '</tpl>')
    });
    Application.components.autocompleteField.superclass.initComponent.call(this);
  },
  
  //2015/05/08 ptanya POSPBA-375 переопределение findRecord с подгрузкой из базы записи, если еще не загрущена
  // private
  
  findRecord : function(prop, v, load){
    var record;
    if (v !== undefined && v !== null){
      var value = '' + v;
      if(this.store.getCount() > 0){
          this.store.each(function(r){
              if(r.data[prop] == value){
                  record = r;
                  return false;
              }
          });
      }
      if (!record && (load === undefined || load)) {
        this.loadRecord(prop, v);
      }
    }
    return record;
  },
  
  loadRecord: function(prop, v) {
    var cmp = this;
    var value = '' + v;
    var minLength = this.loadRecordById ? 1 : this.minChars;

    if(prop === this.valueField && value.length >= minLength && this.value !== v &&
            this.isAlreadyFind(value) ) {
      //зачение не было загружено из базы
      var params = this.getParams4Find(prop, value);

      if (this.loadRecordById) {
        params.loadById = true;
      }

      if (!this.store.loading) {
        this.store.load({params: params, callback: function() {
          cmp.store.loading = false;
          cmp.setValue(value);
        }});
      }
      this.store.loading = true;
    }
  },
  
  isAlreadyFind: function(value) {
    return (!this.store.baseParams.query || value.indexOf(this.store.baseParams.query) === -1);
  },

  getParams4Find: function(prop, v) {
    var params = this.store.baseParams;
    params.query = v;
    return params;
  }
});
