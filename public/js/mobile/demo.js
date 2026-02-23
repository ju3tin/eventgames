document.addEventListener("DOMContentLoaded", function () {

    const version = "1.5.0";
    const year = new Date().getFullYear();

    document.getElementById("app-footer").innerHTML = `
        <div data-role="footer" data-position="fixed" data-tap-toggle="false" class="jqm-footer">
            <p>jQuery Mobile Demos version ${version}</p>
            <p>Copyright ${year} The jQuery Foundation</p>
        </div>
    `;

});

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
}


function buildDynamicHeader(options = {}) {
    var $header = $("#dynamic-header");
    $header.empty();

    // Logo always
    $header.append(
        '<h2><a href="../" title="jQuery Mobile Demos home">' +
        '<img src="/mobile/_assets/img/jquery-logo.png" alt="jQuery Mobile"></a></h2>'
    );

    $header.append('<p><span class="jqm-version"></span> Demos</p>');

    // Conditional left button
    if (options.showBackInsteadOfMenu) {
        $header.append(
            '<a href="#" data-rel="back" class="ui-btn ui-btn-left ui-icon-back ui-btn-icon-notext ui-nodisc-icon">Back</a>'
        );
    } else {
        $header.append(
            '<a href="#" class="jqm-navmenu-link ui-btn ui-btn-icon-notext ui-corner-all ui-icon-bars ui-nodisc-icon ui-alt-icon ui-btn-left">Menu</a>'
        );
    }

    // Conditional right button (e.g., only show search on certain pages)
    if (options.showSearch) {
        $header.append(
            '<a href="#" class="jqm-search-link ui-btn ui-btn-icon-notext ui-corner-all ui-icon-search ui-nodisc-icon ui-alt-icon ui-btn-right">Search</a>'
        );
    }

    // Enhance everything
    $header.toolbar().enhanceWithin();
}

// Usage examples:
// Normal menu + search
buildDynamicHeader({ showSearch: true });

// On a sub-page → show Back instead of Menu, no search
buildDynamicHeader({ showBackInsteadOfMenu: true, showSearch: true });