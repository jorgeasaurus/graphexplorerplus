#Requires -Version 5.1
#Requires -Modules Microsoft.Graph.Applications, Microsoft.Graph.Identity.SignIns

<#
.SYNOPSIS
    Creates a multi-tenant Entra ID app registration for Graph Explorer Plus.
.DESCRIPTION
    Registers a new SPA application in Entra ID configured for Graph Explorer Plus.
    Sets up multi-tenant auth, SPA redirect URIs, and delegated Microsoft Graph
    permissions covering the sample query categories (Users, Groups, Mail, Calendar,
    Teams, OneDrive, Security, Intune, and more).

    The app uses dynamic consent so users are prompted only for the permissions
    each API call requires. The permissions defined here populate the "API permissions"
    blade so tenant admins can grant consent upfront if desired.
.PARAMETER DisplayName
    Display name for the app registration. Defaults to "Graph Explorer Plus".
.PARAMETER RedirectUris
    SPA redirect URIs. Defaults to http://localhost:3000 and http://localhost:3000/explorer.
.PARAMETER IncludeProductionUri
    Optional production URI to add (e.g., https://graphexplorerplus.com).
.PARAMETER UpdateEnvFile
    When specified, writes the client ID to the .env file in the project root.
.PARAMETER EnvFilePath
    Path to the .env file. Defaults to .env in the script's parent directory.
.EXAMPLE
    .\New-GraphExplorerPlusApp.ps1

    Creates the app registration with default settings.
.EXAMPLE
    .\New-GraphExplorerPlusApp.ps1 -IncludeProductionUri "https://graphexplorerplus.azurewebsites.net" -UpdateEnvFile

    Creates the app with a production redirect URI and updates the .env file.
#>

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter()]
    [ValidateNotNullOrEmpty()]
    [string]$DisplayName = 'Graph Explorer Plus',

    [Parameter()]
    [string[]]$RedirectUris = @(
        'http://localhost:3000',
        'http://localhost:3000/explorer'
    ),

    [Parameter()]
    [string]$IncludeProductionUri,

    [Parameter()]
    [switch]$UpdateEnvFile,

    [Parameter()]
    [string]$EnvFilePath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Helpers ────────────────────────────────────────────────────────────

function Write-Step {
    param([string]$Message)
    Write-Host "  $([char]0x25B6) $Message" -ForegroundColor Cyan
}

function Write-Done {
    param([string]$Message)
    Write-Host "  $([char]0x2714) $Message" -ForegroundColor Green
}

# ── Permission Definitions ─────────────────────────────────────────────
# Delegated permissions (scope) covering all sample query categories.
# Users consent at runtime via dynamic consent; these populate the
# "API permissions" blade for optional admin pre-consent.

$DelegatedScopes = @(
    # Core / Getting Started
    'User.Read'
    'User.ReadBasic.All'
    'User.Read.All'
    'User.ReadWrite'
    'openid'
    'profile'
    'email'
    'offline_access'

    # Groups
    'Group.Read.All'
    'Group.ReadWrite.All'
    'GroupMember.Read.All'

    # Mail
    'Mail.Read'
    'Mail.ReadWrite'
    'Mail.Send'
    'MailboxSettings.Read'

    # Calendar
    'Calendars.Read'
    'Calendars.ReadWrite'

    # Contacts
    'Contacts.Read'
    'Contacts.ReadWrite'

    # OneDrive / Files
    'Files.Read'
    'Files.Read.All'
    'Files.ReadWrite'
    'Files.ReadWrite.All'

    # Teams
    'Team.ReadBasic.All'
    'Channel.ReadBasic.All'
    'TeamMember.Read.All'
    'Chat.Read'

    # To Do
    'Tasks.Read'
    'Tasks.ReadWrite'

    # Directory / Roles
    'Directory.Read.All'
    'Directory.AccessAsUser.All'
    'RoleManagement.Read.Directory'

    # Applications
    'Application.Read.All'
    'DelegatedPermissionGrant.Read.All'

    # Security
    'SecurityEvents.Read.All'
    'IdentityRiskyUser.Read.All'
    'Policy.Read.All'
    'Policy.Read.ConditionalAccess'

    # Intune - Devices & Configuration
    'DeviceManagementManagedDevices.Read.All'
    'DeviceManagementManagedDevices.ReadWrite.All'
    'DeviceManagementConfiguration.Read.All'
    'DeviceManagementConfiguration.ReadWrite.All'

    # Intune - Apps
    'DeviceManagementApps.Read.All'
    'DeviceManagementApps.ReadWrite.All'

    # Intune - RBAC
    'DeviceManagementRBAC.Read.All'

    # Intune - Enrollment / Autopilot
    'DeviceManagementServiceConfig.Read.All'
    'DeviceManagementServiceConfig.ReadWrite.All'

    # Audit Logs
    'AuditLog.Read.All'

    # Reports
    'Reports.Read.All'
)

# ── Main ───────────────────────────────────────────────────────────────

Write-Host ''
Write-Host '  Graph Explorer Plus - App Registration Setup' -ForegroundColor White
Write-Host '  =============================================' -ForegroundColor DarkGray
Write-Host ''

# 1. Connect to Microsoft Graph
Write-Step 'Connecting to Microsoft Graph...'

$requiredScopes = @(
    'Application.ReadWrite.All'
)

try {
    $context = Get-MgContext
    if (-not $context) {
        Connect-MgGraph -Scopes $requiredScopes -NoWelcome
    }
    else {
        $missingScopes = $requiredScopes | Where-Object { $_ -notin $context.Scopes }
        if ($missingScopes) {
            Write-Host "    Re-authenticating for missing scopes: $($missingScopes -join ', ')" -ForegroundColor Yellow
            Connect-MgGraph -Scopes $requiredScopes -NoWelcome
        }
    }
    $context = Get-MgContext
    Write-Done "Connected as $($context.Account) (Tenant: $($context.TenantId))"
}
catch {
    Write-Error "Failed to connect to Microsoft Graph: $_"
    return
}

# 2. Check for existing app
Write-Step "Checking for existing '$DisplayName' registration..."
$existingApp = Get-MgApplication -Filter "displayName eq '$DisplayName'" -Top 1

if ($existingApp) {
    Write-Host "    Found existing app: $($existingApp.AppId)" -ForegroundColor Yellow
    $choice = Read-Host "    Update existing registration? (Y/n)"
    if ($choice -eq 'n') {
        Write-Host '    Aborted.' -ForegroundColor Yellow
        return
    }
}

# 3. Build redirect URIs
$allRedirectUris = [System.Collections.Generic.List[string]]::new($RedirectUris)
if ($IncludeProductionUri) {
    $allRedirectUris.Add($IncludeProductionUri)
    if (-not $allRedirectUris.Contains("$IncludeProductionUri/explorer")) {
        $allRedirectUris.Add("$IncludeProductionUri/explorer")
    }
}

# 4. Resolve Microsoft Graph service principal and permission IDs
Write-Step 'Resolving Microsoft Graph permission IDs...'

$graphSp = Get-MgServicePrincipal -Filter "appId eq '00000003-0000-0000-c000-000000000000'" -Top 1
if (-not $graphSp) {
    Write-Error 'Could not find Microsoft Graph service principal in tenant.'
    return
}

$resolvedPermissions = [System.Collections.Generic.List[hashtable]]::new()
$failedScopes = [System.Collections.Generic.List[string]]::new()

foreach ($scopeName in $DelegatedScopes) {
    $oauth2Permission = $graphSp.Oauth2PermissionScopes |
        Where-Object { $_.Value -eq $scopeName } |
        Select-Object -First 1

    if ($oauth2Permission) {
        $resolvedPermissions.Add(@{
            Id   = $oauth2Permission.Id
            Type = 'Scope'  # Delegated
        })
    }
    else {
        $failedScopes.Add($scopeName)
    }
}

if ($failedScopes.Count -gt 0) {
    Write-Host "    Warning: Could not resolve $($failedScopes.Count) scope(s): $($failedScopes -join ', ')" -ForegroundColor Yellow
}

Write-Done "Resolved $($resolvedPermissions.Count) / $($DelegatedScopes.Count) delegated permissions"

# 5. Build the app registration body
$appBody = @{
    DisplayName            = $DisplayName
    SignInAudience         = 'AzureADMultipleOrgs'  # Multi-tenant (work/school accounts)
    Spa                    = @{
        RedirectUris = $allRedirectUris.ToArray()
    }
    RequiredResourceAccess = @(
        @{
            ResourceAppId  = '00000003-0000-0000-c000-000000000000'  # Microsoft Graph
            ResourceAccess = $resolvedPermissions.ToArray()
        }
    )
    Web                    = @{
        ImplicitGrantSettings = @{
            EnableAccessTokenIssuance = $false
            EnableIdTokenIssuance     = $false
        }
    }
    Tags                   = @('GraphExplorerPlus', 'SPA', 'MultiTenant')
}

# 6. Create or update the app registration
if ($existingApp) {
    Write-Step "Updating existing app registration ($($existingApp.AppId))..."

    if ($PSCmdlet.ShouldProcess($existingApp.AppId, 'Update app registration')) {
        $updateParams = @{
            ApplicationId          = $existingApp.Id
            Spa                    = $appBody.Spa
            RequiredResourceAccess = $appBody.RequiredResourceAccess
            Tags                   = $appBody.Tags
        }
        Update-MgApplication @updateParams
        $app = Get-MgApplication -ApplicationId $existingApp.Id
        Write-Done "Updated app registration"
    }
}
else {
    Write-Step "Creating app registration '$DisplayName'..."

    if ($PSCmdlet.ShouldProcess($DisplayName, 'Create app registration')) {
        $app = New-MgApplication -BodyParameter $appBody
        Write-Done "Created app registration"
    }
}

if (-not $app) { return }

# 7. Ensure a service principal exists (required for consent)
Write-Step 'Ensuring service principal exists...'
$appSp = Get-MgServicePrincipal -Filter "appId eq '$($app.AppId)'" -Top 1

if (-not $appSp) {
    $appSp = New-MgServicePrincipal -AppId $app.AppId
    Write-Done "Created service principal ($($appSp.Id))"
}
else {
    Write-Done "Service principal already exists ($($appSp.Id))"
}

# 8. Update .env file
if ($UpdateEnvFile) {
    if (-not $EnvFilePath) {
        $EnvFilePath = Join-Path (Split-Path $PSScriptRoot -Parent) '.env'
    }

    Write-Step "Updating $EnvFilePath..."

    if (Test-Path $EnvFilePath) {
        $envContent = Get-Content -Path $EnvFilePath -Raw
        $envContent = $envContent -replace '(?m)^NEXT_PUBLIC_MSAL_CLIENT_ID=.*$', "NEXT_PUBLIC_MSAL_CLIENT_ID=`"$($app.AppId)`""
        Set-Content -Path $EnvFilePath -Value $envContent.TrimEnd() -NoNewline
        Write-Done "Updated NEXT_PUBLIC_MSAL_CLIENT_ID in .env"
    }
    else {
        Write-Host "    .env file not found at $EnvFilePath" -ForegroundColor Yellow
    }
}

# ── Summary ────────────────────────────────────────────────────────────

Write-Host ''
Write-Host '  Registration Complete' -ForegroundColor Green
Write-Host '  =====================' -ForegroundColor DarkGray
Write-Host ''
Write-Host "  Display Name:    $($app.DisplayName)"
Write-Host "  Client ID:       $($app.AppId)" -ForegroundColor White
Write-Host "  Object ID:       $($app.Id)"
Write-Host "  Tenant:          $($context.TenantId)"
Write-Host "  Sign-in:         Multi-tenant (work & school accounts)"
Write-Host "  Platform:        SPA (Single Page Application)"
Write-Host "  Redirect URIs:   $($allRedirectUris -join ', ')"
Write-Host "  Permissions:     $($resolvedPermissions.Count) delegated Microsoft Graph scopes"
Write-Host ''
Write-Host '  .env Configuration' -ForegroundColor DarkGray
Write-Host '  -------------------'
Write-Host "  NEXT_PUBLIC_MSAL_CLIENT_ID=`"$($app.AppId)`""
Write-Host '  NEXT_PUBLIC_MSAL_AUTHORITY="https://login.microsoftonline.com/common"'
Write-Host "  NEXT_PUBLIC_MSAL_REDIRECT_URI=`"$($allRedirectUris[0])`""
Write-Host ''
Write-Host '  Next Steps' -ForegroundColor DarkGray
Write-Host '  ----------'
Write-Host '  1. Copy the .env values above into your .env file (or use -UpdateEnvFile)'
Write-Host '  2. Users from ANY tenant can sign in - no admin consent required for basic scopes'
Write-Host '  3. Intune/Directory scopes may require tenant admin consent via:'
Write-Host "     https://login.microsoftonline.com/common/adminconsent?client_id=$($app.AppId)"
Write-Host ''

# Return the app object for pipeline use
$app
