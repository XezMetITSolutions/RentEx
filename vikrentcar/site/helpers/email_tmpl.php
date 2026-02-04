<?php
/**
 * @package     VikRentCar
 * @subpackage  com_vikrentcar
 * @author      Alessio Gaggii - e4j - Extensionsforjoomla.com
 * @copyright   Copyright (C) 2018 e4j - Extensionsforjoomla.com. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE
 * @link        https://vikwp.com
 */

/**
 * Some special tags between curly brackets can be used to display certain values such as:
 * {logo}, {company_name}, {order_id}, {confirmnumb}, {order_status}, {order_date}, {customer_info}, {item_name},
 * {pickup_date}, {pickup_location}, {dropoff_date}, {dropoff_location}, {order_details}, {order_total},
 * {order_deposit}, {order_total_paid}, {order_link}, {footer_emailtext}
 *
 * The record of the order can be accessed from the following global array in case you need any extra content or to perform queries for a deeper customization level:
 * $order_details (order array)
 * Example: the ID of the order is contained in $order_details['id'] - you can see the whole array content with the code "print_r($order_details)"
 * 
 * It is also possible to access the customer information array by using this code:
 * $customer = VikRentCar::getCPinIstance()->getCustomerFromBooking($order_details['id']);
 * The variable $customer will always be an array, even if no customers were found. In this case, the array will be empty.
 * Debug the content of the array with the code "print_r($customer)" by placing it on any part of the PHP content below.
 */

defined('ABSPATH') or die('No script kiddies please!');

// defined('VIKRENTCAREXEC') OR die('Restricted Area');

?>

<style type="text/css">
<!--
.boxstatusorder p {
	margin:0;
	padding:0;
}
.boxstatusorder:last-child {
	margin:0 0 10px 0;
}
.persdetail {
	line-height:1.6em;
}
.persdetail h3 {
	margin:0 0 10px 0;
	padding:0;
}
.hireorderdetail {
	margin-top: 15px;
}
.hiremainbox h4 {
	margin-bottom: 12px;
}
.hirecar .hiredate {
	flex: 1;
	border:1px solid #eee;
	border-radius:4px;
	padding:10px;
	margin:0 10px 0 0;
	background:#fbfbfb;
}
.hirecar .hiredate:last-child {
	margin:0;
}
.hirecar .hiredate p {
	padding:0;
	margin:0px 0 5px;
}
.hirecar .hiredate p span {
	display:block;
}
.hireordata {
	margin:0 0 7px 0;
}
.hireordata div {
	float:right;
}
.hiretotal {
	margin: 10px 0 7px 0;
	color: #144D5C;
	border-top: 1px solid #ddd;
	padding: 10px 0 0 0;
	font-size: 16px;
	font-weight: bold;
}
.smalltext {
	font-size:12px;
}
.Stile7 {color: #009900;}
.confirmed {color: #009900;}
.standby {color: #ff0000;}
.Stile10 {font-size: 14px;font-weight: bold;}
.Stile16 {font-size: 16px;}
.vrc-email-summ-status {
	font-weight: bold;
}
.vrc-emailc-footer {
	margin-top: 35px
}
@media screen and (max-width : 580px) {
	.boxstatusorder {
		margin: 0;
		flex-basis: 100%;
	}
	.boxstatusorder:last-child {
		margin-bottom: 0;
	}
	.hirecar .hiredate {
		margin: 5px 0 10px;
		flex-basis: 100%;
	}
}
-->
</style>

<div class="vrc-emailc-wrap" style="max-width: 642px; background: #fff; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; border-left: 1px solid #ddd; border-right: 1px solid #ddd; margin: 0 auto; padding: 24px;">
	<div class="vrc-emailc-logo" style="text-align: center; margin: 8px 0;">{logo}</div>

	<div class="container" style="font-family: "Century Gothic", Tahoma, Arial;">
		<p class="Stile1" style="font-size: 18px; font-weight: bold;">{company_name}</p>
		<div class="statusorder" style="display: flex; flex-wrap: wrap; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; margin-bottom: 15px;">
			<div class="boxstatusorder" style="padding:10px; margin:0 5px 10px 0; flex: 1;">
				<span class="vrc-email-summ-lbl" style="display: block; font-weight: bold; margin-bottom: 2px; font-size: 1.1em;"><?php echo JText::_('VRCORDERNUMBER'); ?></span> 
				<span class="vrc-email-summ-values">{order_id}</span>
			</div>
			{confirmnumb_delimiter}
			<div class="boxstatusorder" style="padding:10px; margin:0 5px 10px 0; flex: 1;">
				<span class="vrc-email-summ-lbl" style="display: block; font-weight: bold; margin-bottom: 2px; font-size: 1.1em;"><?php echo JText::_('VRCCONFIRMATIONNUMBER'); ?></span> 
				<span class="vrc-email-summ-values">{confirmnumb}</span>
			</div>
			{/confirmnumb_delimiter}
			<div class="boxstatusorder" style="padding:10px; margin:0 5px 10px 0; flex: 1;">
				<span class="vrc-email-summ-lbl" style="display: block; font-weight: bold; margin-bottom: 2px; font-size: 1.1em;"><?php echo JText::_('VRLIBSEVEN'); ?></span> 
				<span style="font-weight: bold;" class="vrc-email-summ-values vrc-email-summ-status {order_status_class}">{order_status}</span>
			</div>
			<div class="boxstatusorder" style="padding:10px; margin:0 5px 10px 0; flex: 1;">
				<span class="vrc-email-summ-lbl" style="display: block; font-weight: bold; margin-bottom: 2px; font-size: 1.1em;"><?php echo JText::_('VRLIBEIGHT'); ?></span> 
				<span class="vrc-email-summ-values">{order_date}</span>
			</div>
		</div>
		<div class="persdetail">
			<h3  style="font-size: 18px; font-weight: bold;"><?php echo JText::_('VRLIBNINE'); ?></h3>
			{customer_info}
		</div>
		<div class="hiremainbox">
			<h4 style="font-size: 18px; font-weight: bold; margin-bottom: 12px;"><?php echo JText::_('VRLIBTEN'); ?>: {item_name}</h4>
			<div class="hirecar" style="display: flex; flex-wrap: wrap;">
				<div class="hiredate" style="flex: 1; border:1px solid #eee; border-radius:4px; padding:10px; margin:0 10px 0 0; background:#fbfbfb;">
					<p style="padding: 0; margin: 0px 0 5px; display: inline-block; margin-right: 10px;">
						<span class="Stile12" style="font-size: 14px;font-weight: bold;"><?php echo JText::_('VRLIBELEVEN'); ?></span> 
						<span class="Stile9" style="font-size: 14px;">{pickup_date}</span></p>
					<p style="padding: 0; display: inline-block;">
						<span class="Stile12" style="font-size: 14px;font-weight: bold;"><?php echo JText::_('VRRITIROCAR'); ?></span> 
						<span class="Stile9" style="font-size: 14px;">{pickup_location}</span>
					</p>
				</div>
				<div class="hiredate" style="flex: 1; border:1px solid #eee; border-radius:4px; padding:10px; margin:0 10px 0 0; background:#fbfbfb;">              
					<p style="padding: 0; margin: 0px 0 5px; display: inline-block; margin-right: 10px;">
						<span class="Stile12" style="font-size: 14px;font-weight: bold;"><?php echo JText::_('VRLIBTWELVE'); ?></span> 
						<span class="Stile9" style="font-size: 14px;">{dropoff_date}</span>
					</p>
					<p style="padding: 0; display: inline-block;">
						<span class="Stile12" style="font-size: 14px;font-weight: bold;"><?php echo JText::_('VRRETURNCARORD'); ?></span> 
						<span class="Stile9" style="font-size: 14px;">{dropoff_location}</span>
					</p>
				</div>
			</div>
			<div class="hireorderdetail" style="margin-top: 15px;">
				<p><span style="font-size: 18px; font-weight: bold;"><?php echo JText::_('VRCORDERDETAILS'); ?></span></p>
				{order_details}
				<div class="hireordata hiretotal" style="margin:0 0 7px 0; margin: 10px 0 7px 0; color: #144D5C; border-top: 1px solid #ddd; padding: 10px 0 0 0; font-size: 16px; font-weight: bold;"><span><?php echo JText::_('VRLIBSIX'); ?></span><div style="float:right;"><strong>{order_total}</strong></div></div>
				{order_deposit}
				{order_total_paid}
			</div>
			<div class="vrc-emailc-footer smalltext" style="margin-top: 35px; font-size:12px;">
				<strong><?php echo JText::_('VRLIBTENTHREE'); ?>:</strong><br/>
				{order_link}           
				<br/>
				<p style="font-weight: bold; margin:0;">Sie müssen Dokumente(Führerschein und Personalausweis/Pass) über den Link Hochladen.</p>
				<p style="font-weight: bold;">Dies erleichtert für uns die erstellung des Mietvertrags beim Abholen des gemieteten Fahrzeugs</p>
				<p class="smalltext" style="font-size:12px;">{footer_emailtext}</p>
			</div>
		</div>
	</div>
</div>