<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Candly API - Documentation</title>
    <link rel="stylesheet" href="/vendor/swagger/swagger-ui.css">
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="/vendor/swagger/swagger-ui-bundle.js"></script>
    <script src="/vendor/swagger/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            window.ui = SwaggerUIBundle({
                url: "/docs/openapi.yaml",
                dom_id: '#swagger-ui',
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout",
                validatorUrl: null
            });
        };
    </script>
</body>
</html>
