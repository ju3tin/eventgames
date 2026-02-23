	    <div data-role="panel" class="jqm-navmenu-panel" data-position="left" data-display="overlay" data-theme="a">
		<ul id="menuList" class="jqm-list ui-alt-icon ui-nodisc-icon"></ul>
    </div><!-- /panel --><script>
	$(document).on("pagecontainershow", function () {
	
		var $menu = $("#menuList");
		if ($menu.data("loaded")) return;
	
		$.getJSON("/menu3.json", function(data) {
			buildMenu(data, $menu);
			$menu.listview().listview("refresh"); // refresh the listview
			$("#mainPanel").trigger("create");    // enhance collapsibles
			$menu.data("loaded", true);
			console.log("Menu loaded correctly");
		}).fail(function(xhr){
			console.log("Error loading /menu3.json", xhr.status, xhr.statusText);
		});
	
	});
	
	function buildMenu(items, container) {
    $.each(items, function(i, item) {
        var $li;

        if (item.children && item.children.length) {
            // Create collapsible with explicit theming
            $li = $('<li data-role="collapsible" ' +
                    'data-enhanced="true" ' +
                    'data-theme="a" ' +               // adjust to your site's swatch
                    'data-content-theme="a" ' +       // key for content background
                    'data-collapsed-icon="carat-d" ' +
                    'data-expanded-icon="carat-u" ' +
                    'data-iconpos="right" ' +
                    'data-inset="false" style="padding: 0px; background-color: #f9f9f9"></li>');

            var $heading = $('<h3 class="ui-collapsible-heading ui-collapsible-heading-collapsed"></h3>');
            var $toggle = $('<a href="#" class="ui-collapsible-heading-toggle ui-btn ui-btn-icon-right ui-btn-inherit ui-icon-carat-d"></a>')
                .text(item.title || "Section")
                .append('<span class="ui-collapsible-heading-status"> click to expand contents</span>');

            $heading.append($toggle);

            var $content = $('<div class="ui-collapsible-content ui-collapsible-content-collapsed" aria-hidden="true"></div>');
            var $ul = $('<ul data-role="listview" data-inset="false"></ul>');

            buildMenu(item.children, $ul);  // recursive

            $content.append($ul);
            $li.append($heading).append($content);

            container.append($li);

            // Enhance collapsible AND nested widgets (listview, etc.)
            $li.collapsible().enhanceWithin();
        } 
        else {
            $li = $("<li></li>");
            if (item.icon) $li.attr("data-icon", item.icon);

            var $a = $("<a></a>")
                .attr("href", item.url || "#")
                .attr("data-ajax", "false")
                .text(item.title);

            $li.append($a);
            container.append($li);
        }
    });
}</script>
