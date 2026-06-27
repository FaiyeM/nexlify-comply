# To learn more about how to use Nix to configure your Firebase Studio / Project IDX workspace, refer to:
# https://developers.google.com/idx/guides/customize-idx-env

{ pkgs, ... }: {
  # Which nixpkgs channel to use
  channel = "stable-24.05"; # Or "unstable"

  # Use NixOS packages for tools you need in your workspace
  packages = [
    pkgs.nodejs_20
  ];

  # Sets environment variables in the workspace
  env = {};

  idx = {
    # Search for VS Code extensions on open-vsx.org
    extensions = [
      "dsznajder.es7-react-js-snippets"
      "esbenp.prettier-vscode"
    ];

    # Enable previews and configure web preview parameters
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host"];
          manager = "web";
        };
      };
    };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        npm-install = "npm install";
      };
      # Runs when the workspace starts up
      onStart = {
        # Optional startup scripts
      };
    };
  };
}
