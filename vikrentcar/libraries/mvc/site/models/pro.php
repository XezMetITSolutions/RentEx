<?php
/** 
 * @package     VikRentCar
 * @subpackage  core
 * @author      E4J s.r.l.
 * @copyright   Copyright (C) 2024 E4J s.r.l. All Rights Reserved.
 * @license     http://www.gnu.org/licenses/gpl-2.0.html GNU/GPL
 * @link        https://vikwp.com
 */

// No direct access
defined('ABSPATH') or die('No script kiddies please!');

JLoader::import('adapter.mvc.models.form');
VikRentCarLoader::import('update.license');

/**
 * VikRentCar plugin License model.
 *
 * @since 1.4.3
 * @see   JModelForm
 */
class VikRentCarModelPro extends JModelForm
{
    /**
     * Validates the provided key against the currently installed one.
     * 
     * @param   string  $key  The license key to validate.
     * 
     * @return  bool    True if equal, false otherwise.
     */
    public function validate(string $key)
    {
        if (!$key)
        {
            $this->setError(new Exception('Bad request', 400));
            return false;
        }

        if (strcmp($key, VikRentCarLicense::getKey()))
        {
            $this->setError(new Exception('Forbidden', 403));
            return false;
        }

        return true;
    }

	/**
	 * Implements the request needed to downgrade the PRO version of the plugin.
	 *
	 * @return 	bool  True on success, false otherwise.
	 */
	public function downgrade()
	{
		try
        {
            JLoader::import('adapter.plugin.installer.adapter');
            $adapter = new JPluginInstallerAdapter('vikrentcar', 'https://downloads.wordpress.org/plugin/vikrentcar.zip');
            $adapter->install();

            VikRentCarLicense::uninstall();
        }
        catch (Exception $error)
        {
            $this->setError($error);
            return false;
        }

        return true;
	}
}
