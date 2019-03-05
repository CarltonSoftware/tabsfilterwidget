import EmbeddableWidget from './embeddable-widget';
import content from './propertyfilters.json';

export default function bookmarklet() {
  if (!window.EmbeddableWidget) {
    window.EmbeddableWidget = EmbeddableWidget;
  }

  // Don't want to run the script again if its active
  if (document.getElementById('tabsfilterwidget')) {
    return;
  }

  var filters = window.tabsfilters || (window.drupalSettings && window.drupalSettings.tabsfilters) || content;
  var defaultValue = window.tabsfiltersdefaultValue || (window.drupalSettings && window.drupalSettings.tabsfiltersdefaultValue) || [];
  var setDefaultValue = function(filters) {
    if (window.drupalSettings && window.drupalSettings.tabsfiltersdefaultValue) {
      window.drupalSettings.tabsfiltersdefaultValue = filters;
    } else {
      window.tabsfiltersdefaultValue = filters;
    }
  };

  EmbeddableWidget.mount(
    filters,
    defaultValue,
    function(filters, filterString) {
      var collection = document.getElementsByClassName('tabsfiltervalue');
      setDefaultValue(filters);
      for (let i of collection) {
        var type = i.tagName.toString().toLowerCase();
        if (type === 'input') {
          i.value = filterString;
        } else {
          i.innerHTML = filterString;
        }
      }
    },
    EmbeddableWidget.unmount
  );
}

bookmarklet();
