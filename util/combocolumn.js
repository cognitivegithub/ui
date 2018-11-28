/**
 * @class Ext.ux.grid.ComboColumn
 * @extends Ext.grid.Column
 *
 * A Column definition class which renders a value using a ComboBox editor. The ComboBox is used to
 * convert the column value to a display value using the ComboBox's valueField and displayField.
 * If the ComboBox editor uses a remote store the column definition needs to be passed the grid's id.
 * See the {@Ext.ux.grid.ComboColumn#gridId gridId} config option of {@link Ext.ux.grid.ComboColumn}
 * for more details.
 *
 * @author    Rob Boerman
 * @copyright (c) 2011, by Rob Boerman
 * @date      20. May 2011
 * @version   1.0

 Example:

 var userCombo = new Ext.ComboBox({
 id: 'myCombo',
 valueField:'id',
 displayField:'name',
 store: ...
 });

 * We need a unique id for the grid, either create one yourself or let Ext create it for you

 var gridId = Ext.id();

 * Create the grid

 var todoGrid = new Ext.grid.EditorGridPanel({
 store: myStore,
 id: gridId,                     // Be sure to include the grid id
 cm: new Ext.grid.ColumnModel({
 columns: [{
 id: 'todo',
 header: 'Todo',
 dataIndex: 'todo'
 },{
 id: 'owner',
 width: 150,
 header: 'Assignee',
 dataIndex: 'owner',
 xtype: 'combocolumn',   // Use the custom column or use the column's render manually
 editor: userCombo,      // The custom column needs a ComboBox editor to be able to render the displayValue, without it just renders value
 gridId: gridId          // Don't forget to specify the grid's id, the columns renderer needs it
 }]
 }),
 clicksToEdit: 1
 });

 * @license Ext.ux.grid.ComboColumn is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 *
 *

 License details: <a href="http://www.gnu.org/licenses/lgpl.html" target="_blank">http://www.gnu.org/licenses/lgpl.html</a>

 */

Ext.ns("Ext.ux.renderer","Ext.ux.grid");

Ext.ux.grid.ComboColumn = Ext.extend(Ext.grid.Column, {

  /**
   * @cfg {String} gridId
   *
   * The id of the grid this column is in. This is required to be able to refresh the view once the combo store has loaded
   */
  gridId: undefined,

  constructor: function(cfg){
    Ext.ux.grid.ComboColumn.superclass.constructor.call(this, cfg);

    // Detect if there is an editor and if it at least extends a combobox, otherwise just treat it as a normal column and render the value itself
    this.renderer = (this.editor && this.editor.triggerAction) ? Ext.ux.renderer.ComboBoxRenderer(this.editor,this.gridId) : function(value) {return value;};
  }
});

Ext.grid.Column.types['combocolumn'] = Ext.ux.grid.ComboColumn;

/* a renderer that makes a editorgrid panel render the correct value */
Ext.ux.renderer.ComboBoxRenderer = function(combo, gridId) {
  /* Get the displayfield from the store or return the value itself if the record cannot be found */
  var getValue = function(value) {
    var idx = combo.store.find(combo.valueField, value);
    var rec = combo.store.getAt(idx);
    if (rec) {
      return rec.get(combo.displayField);
    }
    return value;
  }

  return function(value) {
    /* If we are trying to load the displayField from a store that is not loaded, add a single listener to the combo store's load event to refresh the grid view */
    if (combo.store.getCount() == 0 && gridId) {
      return value;
    }

    return getValue(value);
  };
};