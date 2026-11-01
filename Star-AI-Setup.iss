#define MyAppName "Star-AI"
#define MyAppVersion "2.202.0"
#define MyAppPublisher "PM Studio"
#define MyAppExeName "Star-AI.exe"

[Setup]
; ثابت نگه داشته شود تا نسخه‌های بعدی به عنوان Update شناخته شوند
AppId={{PMStudio-StarAI}}

AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}

; مسیر اولیه، بعداً بر اساس انتخاب 32/64 بیت تغییر می‌کند
DefaultDirName={autopf}\Star-AI

DefaultGroupName=Star-AI

OutputDir=Installer
OutputBaseFilename=Star-AI-Setup-2.202.0

Compression=lzma2
SolidCompression=yes

SetupIconFile=build\setup-icon.ico

PrivilegesRequired=admin

UninstallDisplayIcon={app}\{#MyAppExeName}

; Windows 7 یا بالاتر
MinVersion=6.1

; اجازه اجرا روی Windows 32 و 64 بیت
ArchitecturesAllowed=x86compatible x64compatible

; روی Windows 64 بیت امکان نصب نسخه 64 بیت
ArchitecturesInstallIn64BitMode=x64compatible

; صفحه انتخاب مسیر نصب فعال باشد
DisableDirPage=no

; صفحه Ready to Install فعال باشد
DisableReadyPage=no


[Messages]

WinVersionTooLowError=Star-AI requires Windows 7 or later.%n%nYour version of Windows is too old and is not supported.


[Files]

; ==============================
; Star-AI 64-bit
; ==============================

Source: "release\x64\Star-AI-2.202.0-x64.exe"; \
DestDir: "{app}"; \
DestName: "{#MyAppExeName}"; \
Flags: ignoreversion; \
Check: Is64BitChoice


; ==============================
; Star-AI 32-bit
; ==============================

Source: "release\x86\Star-AI-2.202.0-ia32.exe"; \
DestDir: "{app}"; \
DestName: "{#MyAppExeName}"; \
Flags: ignoreversion; \
Check: Is32BitChoice


[Icons]

Name: "{autodesktop}\Star-AI"; \
Filename: "{app}\{#MyAppExeName}"; \
WorkingDir: "{app}"

Name: "{group}\Star-AI"; \
Filename: "{app}\{#MyAppExeName}"; \
WorkingDir: "{app}"


[Run]

Filename: "{app}\{#MyAppExeName}"; \
Description: "Run Star-AI"; \
WorkingDir: "{app}"; \
Flags: nowait postinstall skipifsilent


[UninstallDelete]

Type: filesandordirs; \
Name: "{app}"


[Code]

var
  ArchitecturePage: TInputOptionWizardPage;


function Is64BitChoice: Boolean;
begin

  if not IsWin64 then
  begin
    Result := False;
    Exit;
  end;

  Result := ArchitecturePage.SelectedValueIndex = 0;

end;


function Is32BitChoice: Boolean;
begin

  if not IsWin64 then
  begin
    Result := True;
    Exit;
  end;

  Result := ArchitecturePage.SelectedValueIndex = 1;

end;


procedure UpdateInstallPath;
var
  WindowsDrive: String;
begin

  WindowsDrive := ExtractFileDrive(ExpandConstant('{win}'));

  if Is64BitChoice then
  begin

    WizardForm.DirEdit.Text :=
      WindowsDrive + '\Program Files\Star-AI';

  end
  else
  begin

    WizardForm.DirEdit.Text :=
      WindowsDrive + '\Program Files (x86)\Star-AI';

  end;

end;


procedure UpdateDiskSpaceLabel;
begin

  if Is64BitChoice then
  begin

    WizardForm.DiskSpaceLabel.Caption :=
      'Required disk space: approximately 82 MB';

  end
  else
  begin

    WizardForm.DiskSpaceLabel.Caption :=
      'Required disk space: approximately 72 MB';

  end;

end;


procedure InitializeWizard;
begin

  {================================}
  { انتخاب نسخه 32 / 64 بیت        }
  {================================}

  ArchitecturePage :=
    CreateInputOptionPage(
      wpWelcome,
      'Choose Star-AI Version',
      'Select the version of Star-AI to install',
      'Choose the version that matches your Windows system:',
      True,
      False
    );


  if IsWin64 then
  begin

    ArchitecturePage.Add(
      'Star-AI 64-bit (Recommended)'
    );

    ArchitecturePage.Add(
      'Star-AI 32-bit'
    );

    ArchitecturePage.SelectedValueIndex := 0;

  end
  else
  begin

    ArchitecturePage.Add(
      'Star-AI 32-bit'
    );

    ArchitecturePage.SelectedValueIndex := 0;

  end;

end;


procedure CurPageChanged(CurPageID: Integer);
begin

  {================================}
  { صفحه انتخاب مسیر نصب            }
  {================================}

  if CurPageID = wpSelectDir then
  begin

    UpdateInstallPath;
    UpdateDiskSpaceLabel;

  end;


  {================================}
  { صفحه Ready to Install           }
  {================================}

  if CurPageID = wpReady then
  begin

    UpdateInstallPath;
    UpdateDiskSpaceLabel;

  end;

end;


function NextButtonClick(CurPageID: Integer): Boolean;
begin

  Result := True;


  {================================}
  { بعد از انتخاب 32/64 بیت         }
  {================================}

  if CurPageID = ArchitecturePage.ID then
  begin

    UpdateInstallPath;

  end;

end;