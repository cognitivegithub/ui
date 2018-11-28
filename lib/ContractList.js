/**
 * Список документов договора
 *
 * @params files - массив файлов
 * @params filesFilter - тип файлов для отображения (Application.models.Contract.FILE_TYPE)
 * @params hide_date_added_col - скрывать колонку с датой добавления, если не указано, то отображается
 * @params hide_last_version_col - скрывать колонку с актуальностью версии, если не указано, то отображается
 */
Ext.ux.ContractsList = Ext.extend(Ext.form.FieldSet, {
  filesFilter: {},
  extraFiles: [],
  buttonAlign: 'center',
  frame: false,
  border: false,
  style: 'margin: 0px; padding: 0px',
  initComponent: function() {
    var component = this;
    this.files = this.files||[];
    var items = [];
    var columns = (component.hide_date_added_col !== true ? 3 : 2);
    if (component.hide_last_version_col) --columns;
    var appendFile = function (file) {
        if (!file.text && component.hide_last_version_col !== true) {
            var status = {html:file.is_last_version ? '<b>Последняя версия</b>' : 'Неактуален',
                cellCls:'width_150px'
            };
            items.push(status);
        }
        items.push({
            html:getFileInfoHtml(file, false),
            colspan:file.text ? (columns) : undefined
        });
        if (!file.text && component.hide_date_added_col !== true) {
            items.push({
                html:file.date_added ? ('Добавлен: ' + Ext.util.Format.localDateRenderer(parseDate(file.date_added))) : '',
                cellCls:'width_220px'
            });
        }
    };

    Ext.each(this.extraFiles, appendFile);

    Ext.each(this.files, function(file){
      var filters = ['type_id', 'supplier_id', 'customer_id'];
      var f, i;
      for (i=0; i<filters.length; i++) {
        f = filters[i];
        if ( (undefined !== component.filesFilter[f]) && file[f]!=component.filesFilter[f]) {
          return;
        }
      }
      appendFile(file);
    });

    if (0==items.length) {
      items = [
        {
          colspan: columns,
          cls: 'normal-text',
          style: 'font-size: 12px',
          html: 'Файлы отсутствуют'
        }
      ]
    }
    if (this.items) {
      for (var i=0; i<this.items.length; i++) {
        var item = this.items[i];
        item.colspan = columns;
        items.push(item);
      }
    }
    Ext.apply(this, {
      layout: 'table',
      autoHeight: true,
      layoutConfig: {
        columns: columns
      },
      defaults: {
        autoHeight: true,
        border: false,
        frame: false,
        style: 'margin-top: 5px; margin-bottom: 5px;',
        cellCls: 'bottom-valign'
      },
      items: items
    });
    Ext.ux.ContractsList.superclass.initComponent.call(this);
  }
});

Ext.reg('ux.contractlist', Ext.ux.ContractsList);
