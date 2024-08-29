document.addEventListener('DOMContentLoaded', () => {
    const showHideButton = document.getElementById('show-hide-box');
    const boxShown = document.getElementById('box-shown');
    const addAppButton = document.getElementById('add-app');
    const headerType1Button = document.getElementById('header-type1');
    const headerInfoButton = document.getElementById('header-info');
    const headerHDevButton = document.getElementById('header-hdevelopers');
    const infoBox = document.getElementById('info-box');
    const menuBox = document.getElementById('menu-box');
    const helpDevelopersBox = document.getElementById('help-developers');
    const discordInviteButton = document.getElementById('discord-invite');
    const allowDiscordAppCheckbox = document.getElementById('allow-discord-app');

    // Toggle visibility of the bot box
    if (showHideButton && boxShown) {
        showHideButton.addEventListener('click', () => {
            if (boxShown.style.display === 'none' || !boxShown.style.display) {
                boxShown.style.display = 'block';
            } else {
                boxShown.style.display = 'none';
            }
        });
    }

    // Handle Add App button click
    if (addAppButton) {
        addAppButton.addEventListener('click', () => {
            const oauthUrl = 'https://discord.com/oauth2/authorize?client_id=1257962930863865866&scope=bot%20applications.commands&permissions=8';

            // Define the dimensions and features for the pop-out window
            const windowFeatures = 'width=600,height=600,scrollbars=yes,resizable=yes';

            // Open the URL in a pop-out window
            window.open(oauthUrl, 'discordAuth', windowFeatures);
        });
    }

    // Handle Help Developers button click
    if (headerHDevButton && helpDevelopersBox) {
        headerHDevButton.addEventListener('click', () => {
            if (helpDevelopersBox.style.display === 'none' || !helpDevelopersBox.style.display) {
                helpDevelopersBox.style.display = 'block';
                infoBox.style.display = 'none';
                menuBox.style.display = 'none';
            } else {
                helpDevelopersBox.style.display = 'none';
            }
        });
    }

    // Handle Info button click
    if (headerInfoButton && infoBox) {
        headerInfoButton.addEventListener('click', () => {
            if (infoBox.style.display === 'none' || !infoBox.style.display) {
                infoBox.style.display = 'block';
                helpDevelopersBox.style.display = 'none';
                menuBox.style.display = 'none';
            } else {
                infoBox.style.display = 'none';
            }
        });
    }

    // Handle Menu button click
    if (headerType1Button && menuBox) {
        headerType1Button.addEventListener('click', () => {
            if (menuBox.style.display === 'none' || !menuBox.style.display) {
                menuBox.style.display = 'block';
                infoBox.style.display = 'none';
                helpDevelopersBox.style.display = 'none';
            } else {
                menuBox.style.display = 'none';
            }
        });
    }

    // Handle Discord Invite button click
    if (discordInviteButton && allowDiscordAppCheckbox) {
        discordInviteButton.addEventListener('click', () => {
            const inviteCode = 'TJeE2vnMWm';
            const discordAppUrl = `discord://discordapp.com/invite/${inviteCode}`;
            const webInviteUrl = `https://discord.gg/${inviteCode}`;

            if (allowDiscordAppCheckbox.checked) {
                window.location.href = discordAppUrl; // Opens in the Discord app
            } else {
                window.open(webInviteUrl, '_blank'); // Opens in the web browser
            }
        });
    }

    const copyEmailButton = document.getElementById('copy-email');

    // Predefined email address to copy
    const emailToCopy = 'skunkplatformer@gmail.com';

    if (copyEmailButton) {
        copyEmailButton.addEventListener('click', () => {
            // Copy the email to clipboard
            navigator.clipboard.writeText(emailToCopy).then(() => {
                // Change button text
                copyEmailButton.textContent = 'Copied E-Mail';

                // Disable the button
                copyEmailButton.disabled = true;

                // Change button color
                copyEmailButton.style.backgroundColor = 'green';
                copyEmailButton.style.color = 'white';

                // Re-enable button after 5 seconds
                setTimeout(() => {
                    copyEmailButton.textContent = 'Copy E-Mail'; // Reset button text
                    copyEmailButton.disabled = false; // Enable button
                    copyEmailButton.style.backgroundColor = '#3498db'; // Reset button color
                    copyEmailButton.style.color = 'white'; // Reset text color
                }, 5000);
            }).catch(err => {
                console.error('Failed to copy email: ', err);
            });
        });
    }
});
