-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 20, 2025 at 05:37 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `news_test`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `email`, `password`, `created_at`) VALUES
(1, 'Soba', 'soba@gmail.com', '$2b$10$5eJ08lr3WBtCqxYwH15mOuCUEC0uiQSCdeFdy1uTcSo3obqt08uue', '2025-05-19 05:45:51');

-- --------------------------------------------------------

--
-- Table structure for table `cashiers`
--

CREATE TABLE `cashiers` (
  `CashierID` int(11) NOT NULL,
  `cashier_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tel_num` varchar(10) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `join_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cashiers`
--

INSERT INTO `cashiers` (`CashierID`, `cashier_name`, `email`, `password`, `tel_num`, `profile_image`, `is_admin`, `join_date`) VALUES
(10, 'cashier1', 'cashier123@gmail.com', '$2b$10$DIXo5zEZ32Bd/PoVMQgjt.pbi.lwYAhR1znp7QxlroBffkKb19WgC', '0718319210', NULL, 0, '2025-05-19 03:29:13'),
(11, 'cashier2', 'cashier2@gmail.com', '$2b$10$tvuFmD6876Cn7qHdaiEWyeXk0JdASdVTxBT2M/8J6aUqu5hGJNccy', '0777463186', NULL, 0, '2025-05-19 05:47:18'),
(12, 'cashier3', 'cashier3@gmail.com', '$2b$10$974LrNzQNfa0m9py.7vuSukyDQzznuRjPp3B417JHd6VVhdOwYHjy', '0718319210', NULL, 0, '2025-05-19 11:43:33'),
(13, 'cashier4', 'cashier4@gmail.com', '$2b$10$OEVeRnk4q/goJW/VZ6KqDOxse8YjSVawGlchm2K6MA5ljGGfW5ZsS', '0718914567', NULL, 0, '2025-05-19 12:00:25');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `CustomerID` int(11) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tel_num` varchar(10) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `join_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`CustomerID`, `customer_name`, `email`, `password`, `tel_num`, `profile_image`, `join_date`) VALUES
(8, 'Tharindu', 'tharindu2002pathmasiri@gmail.com', '$2b$10$rlbmBO3JpIuVP1Nt82lIweS4TNkPNq09zrc0aIGaMDoO61fUmwR2C', '0716821170', '1747641019273-medal design.jpg', '2025-05-19 04:16:20');

-- --------------------------------------------------------

--
-- Table structure for table `custom_orders`
--

CREATE TABLE `custom_orders` (
  `order_id` int(11) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `description` text NOT NULL,
  `quantity` int(11) NOT NULL,
  `status` enum('pending','in_progress','completed','cancelled','approved') DEFAULT 'pending',
  `special_notes` text DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `want_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_orders`
--

INSERT INTO `custom_orders` (`order_id`, `customer_id`, `description`, `quantity`, `status`, `special_notes`, `category`, `created_at`, `updated_at`, `want_date`) VALUES
(42, '8', 'gold 60\r\nsilver 60\r\nbronze 60', 179, 'completed', NULL, 'Medals', '2025-05-19 04:18:02', '2025-05-19 09:04:27', '2025-05-23'),
(43, '7', 'School batches', 100, 'completed', NULL, 'Badges', '2025-05-19 06:39:10', '2025-05-19 09:03:16', '2025-05-30'),
(44, '8', 'Mugs for birthday', 10, 'completed', NULL, 'Mugs', '2025-05-19 07:16:47', '2025-05-19 09:17:04', '2025-05-23');

-- --------------------------------------------------------

--
-- Table structure for table `custom_order_designs`
--

CREATE TABLE `custom_order_designs` (
  `design_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_order_designs`
--

INSERT INTO `custom_order_designs` (`design_id`, `order_id`, `file_name`, `file_type`, `file_path`) VALUES
(41, 42, '1747628252908-medal design.jpg', 'image/jpeg', 'uploads\\1747628252908-medal design.jpg'),
(42, 43, '1747636750231-medal design.jpg', 'image/jpeg', 'uploads\\1747636750231-medal design.jpg'),
(43, 44, '1747639007315-mug design.jpg', 'image/jpeg', 'uploads\\1747639007315-mug design.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `custom_order_requests`
--

CREATE TABLE `custom_order_requests` (
  `request_id` varchar(100) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `item_type` enum('medal','batch','mug','souvenir') NOT NULL,
  `design_image` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `service_charge` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','approved','rejected','completed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `want_date` date DEFAULT NULL,
  `special_notes` text DEFAULT NULL,
  `payment_option` enum('full','advance') DEFAULT 'full',
  `amount_paid` decimal(10,2) DEFAULT 0.00,
  `payment_status` enum('paid','partially_paid','unpaid') DEFAULT 'unpaid',
  `payment_method` varchar(50) NOT NULL DEFAULT 'Full'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_order_requests`
--

INSERT INTO `custom_order_requests` (`request_id`, `customer_name`, `description`, `item_type`, `design_image`, `quantity`, `unit_price`, `total_amount`, `service_charge`, `status`, `created_at`, `updated_at`, `want_date`, `special_notes`, `payment_option`, `amount_paid`, `payment_status`, `payment_method`) VALUES
('CC001', 'Chathura', 'brass and wood', 'souvenir', '/uploads/custom-orders/designImage-1747628906916-650531695.jpg', 1, 20.00, 700.00, 0.00, 'completed', '2025-05-19 04:28:26', '2025-05-19 04:29:41', '2025-05-23', NULL, 'advance', 700.00, 'paid', 'Full'),
('CC002', 'Dulan', 'gold 1', 'medal', '/uploads/custom-orders/designImage-1747630539576-175451643.jpg', 1, 450.00, 950.00, 0.00, 'pending', '2025-05-19 04:55:39', '2025-05-19 04:55:39', '2025-05-22', NULL, 'advance', 285.00, 'partially_paid', 'Full'),
('REQ-613692', 'Chathura', 'hiii', '', '/uploads/1747658948259-246280950-medal design.jpg', 10, 500.00, 6000.00, 1000.00, 'pending', '2025-05-19 12:49:08', '2025-05-19 12:49:08', '2025-05-29', '', 'full', 6000.00, 'paid', 'Full'),
('REQ-408351', 'Uchintha', 'School Medal', '', '/uploads/1747659041795-964023990-medal design.jpg', 10, 450.00, 5500.00, 1000.00, 'completed', '2025-05-19 12:50:41', '2025-05-19 12:51:19', '2025-05-30', '', 'full', 1650.00, '', 'Partial'),
('REQ-400268', 'Navindu jr', 'batch', '', '/uploads/1747659532616-661762599-Crystal_Trophy_1-300x300.png', 8, 50.00, 2400.00, 2000.00, 'pending', '2025-05-19 12:58:52', '2025-05-19 12:58:52', '2025-05-29', '', 'full', 2400.00, 'paid', 'Full'),
('REQ-146841', 'Navindu jr', 'batch', '', '/uploads/1747659540856-97684490-Crystal_Trophy_1-300x300.png', 8, 50.00, 2400.00, 2000.00, 'pending', '2025-05-19 12:59:00', '2025-05-19 12:59:00', '2025-05-29', '', 'full', 720.00, '', 'Partial'),
('REQ-676269', 'muthuka', '10', '', '/uploads/1747659596946-503029416-chemicals.jpg', 10, 50.00, 2500.00, 2000.00, 'pending', '2025-05-19 12:59:56', '2025-05-19 12:59:56', '2025-05-30', '', 'full', 750.00, '', 'Partial'),
('REQ-137108', 'dulann', 'dddddddddddddd', '', '/uploads/1747660060056-143975482-medalMold.jpg', 100, 50.00, 9999.99, 4999.99, 'completed', '2025-05-19 13:07:41', '2025-05-19 13:29:11', '2025-05-31', '', 'full', 9999.99, 'paid', 'advance'),
('REQ-152661', 'mama', 'aaaaaaaaaaaaaaaaaaaaa', '', '/uploads/1747660869184-780604286-chemicals.jpg', 100, 450.00, 46000.00, 1000.00, 'pending', '2025-05-19 13:21:09', '2025-05-19 13:28:53', '2025-05-30', '', 'full', 46000.00, 'paid', 'advance');

-- --------------------------------------------------------

--
-- Table structure for table `invoice`
--

CREATE TABLE `invoice` (
  `invoice_id` int(11) NOT NULL,
  `quotation_id` bigint(20) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `payment_status` enum('Pending','Partially Paid','Paid') DEFAULT 'Pending',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `quotation_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `payment_status` enum('Pending','Partially Paid','Completed') DEFAULT 'Pending',
  `customer_approval_status` enum('pending','approved','cancelled') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `quotation_id`, `total_amount`, `created_at`, `paid_amount`, `payment_status`, `customer_approval_status`) VALUES
(41, 42, 80550.00, '2025-05-19 04:19:45', 80550.00, 'Completed', 'approved'),
(42, 43, 2000.00, '2025-05-19 06:41:11', 2000.00, 'Completed', 'approved'),
(43, 44, 450.00, '2025-05-19 09:04:42', 450.00, 'Completed', 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_item`
--

CREATE TABLE `invoice_item` (
  `item_id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `material_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `material_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `material_name`, `quantity`, `unit_price`) VALUES
(45, 41, 'Medal plates', 179, 450.00),
(46, 42, 'Brass Plates', 2, 1000.00),
(47, 43, 'Medal plates', 1, 450.00);

-- --------------------------------------------------------

--
-- Table structure for table `manual_orders`
--

CREATE TABLE `manual_orders` (
  `order_id` varchar(100) NOT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_method` varchar(50) DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `manual_orders`
--

INSERT INTO `manual_orders` (`order_id`, `customer_name`, `total_amount`, `order_date`, `payment_method`, `items`) VALUES
('SCC001', 'anjana samarasinghe', 2100.00, '2025-05-19 12:05:20', 'cash', '[{\"productId\":\"P002\",\"name\":\"Personalized Photo Frame Crystal Glass BSJ10B\",\"price\":700,\"quantity\":3,\"stock\":14}]'),
('SCC002', 'tharindu', 700.00, '2025-05-19 12:13:55', 'cash', '[{\"productId\":\"P002\",\"name\":\"Personalized Photo Frame Crystal Glass BSJ10B\",\"price\":700,\"quantity\":1,\"stock\":11}]');

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `item_id` varchar(50) NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `available_qty` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `preorder_level` int(11) DEFAULT 10
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`item_id`, `item_name`, `available_qty`, `unit_price`, `preorder_level`) VALUES
('M001', 'Medal plates', 321, 450.00, 10),
('M002', 'Brass Plates', 20, 1000.00, 10),
('M003', 'Plastic Plates', 25, 600.00, 10),
('M004', 'Brass chemical', 10, 1200.00, 10),
('M005', 'Chem2', 20, 2500.00, 10);

-- --------------------------------------------------------

--
-- Table structure for table `material_images`
--

CREATE TABLE `material_images` (
  `id` int(11) NOT NULL,
  `material_id` varchar(50) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `material_images`
--

INSERT INTO `material_images` (`id`, `material_id`, `file_path`, `file_type`, `file_name`) VALUES
(13, 'M001', 'uploads\\1747626430895-images.jpg', 'image/jpeg', '1747626430895-images.jpg'),
(14, 'M002', 'uploads\\1747626465995-images.jpg', 'image/jpeg', '1747626465995-images.jpg'),
(15, 'M003', 'uploads\\1747626490618-images.jpg', 'image/jpeg', '1747626490618-images.jpg'),
(16, 'M004', 'uploads\\1747626517864-images.jpg', 'image/jpeg', '1747626517864-images.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_method` enum('full','advance') NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `shipping_address` text DEFAULT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `current_status` enum('processing','shipped','delivered','cancelled') DEFAULT 'processing'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `customer_id`, `order_date`, `total_amount`, `payment_status`, `payment_method`, `amount_paid`, `shipping_address`, `contact_number`, `current_status`) VALUES
(19, 8, '2025-05-19 10:38:45', 700.00, 'paid', 'full', 700.00, NULL, NULL, 'shipped'),
(20, 8, '2025-05-19 12:53:24', 700.00, 'paid', 'advance', 700.00, NULL, NULL, 'shipped'),
(21, 8, '2025-05-19 13:39:21', 3500.00, 'paid', 'advance', 3500.00, NULL, NULL, 'shipped'),
(22, 8, '2025-05-19 18:43:50', 700.00, 'refunded', 'advance', 210.00, NULL, NULL, 'shipped');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `order_id`, `product_id`, `quantity`, `unit_price`) VALUES
(20, 19, 'P001', 1, 700.00),
(21, 20, 'P002', 1, 700.00),
(22, 21, 'P001', 5, 700.00),
(23, 22, 'P001', 1, 700.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `name`, `category`, `price`, `stock`, `description`, `created_at`) VALUES
('P001', 'Personalized Photo Frame Crystal Glass BXP02', 'Souvenirs', 700.00, 14, 'Perfect sublimation crystal photo blocks (BXP02) have become popular nowadays. This custom engraved crystal would be a fabulous gift for any occasion, especially on your office or wedding anniversary, birthday, or on valentine’s day. It will look lovely placed as exclusive decor anywhere in the house. This crystal trophy made of genuine, high quality crystal that provides superior sublimation results.', '2025-05-19 09:56:25'),
('P002', 'Personalized Photo Frame Crystal Glass BSJ10B', 'Souvenirs', 700.00, 9, 'Perfect sublimation crystal photo blocks (BSJ10B) have become popular nowadays. This custom engraved crystal would be a fabulous gift for any occasion, especially on your office or wedding anniversary, birthday, or on valentine’s day. It will look lovely placed as exclusive decor anywhere in the house. This crystal trophy made of genuine, high quality crystal that provides superior sublimation results', '2025-05-19 12:03:59'),
('P004', 'Sublimation 11oz Glass Mugs Gradient', 'Mug', 500.00, 13, 'Softnet best seller premium sublimation mug, coated with sublimation coating gives you superb color reproduction every time. These high quality white ceramic mugs are perfect for making photo mugs, promotions, gifts, personal keepsakes, artwork showcasing, and much more.', '2025-05-19 13:46:40');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` varchar(100) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `file_name`, `file_type`, `file_path`, `uploaded_at`) VALUES
(9, 'P001', '1747648585654-productImage.png', 'image/png', 'uploads\\1747648585654-productImage.png', '2025-05-19 09:56:25'),
(10, 'P002', '1747656239037-productImage.png', 'image/png', 'uploads\\1747656239037-productImage.png', '2025-05-19 12:03:59'),
(11, 'P004', '1747662400285-productImage.jpg', 'image/jpeg', 'uploads\\1747662400285-productImage.jpg', '2025-05-19 13:46:40');

-- --------------------------------------------------------

--
-- Table structure for table `supervisors`
--

CREATE TABLE `supervisors` (
  `SupervisorID` int(11) NOT NULL,
  `supervisor_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tel_num` varchar(10) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `join_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supervisors`
--

INSERT INTO `supervisors` (`SupervisorID`, `supervisor_name`, `email`, `password`, `tel_num`, `profile_image`, `join_date`) VALUES
(9, 'supervisor1', 'supervisor1@gmail.com', '$2b$10$0kmFMrzFbVIugcdnEVkz9.F5CQRwtgxeTohkGZkuCXCGVBbwuf7KS', '0714567890', NULL, '2025-05-19 03:39:55'),
(10, 'supervisor2', 'supervisor2@gmail.com', '$2b$10$aUPBe4f.7yyqq8PBYWkYV.5yQ9tBRZLPK8JR.dh2holIwSmFCMK3y', '0775673456', NULL, '2025-05-19 12:01:39'),
(11, 'supervisor3', 'supervisor3@gmail.com', '$2b$10$QMqSlG6EUVJ/2H1rH2/4veC06rmCEEJ/h2Vz1hOjFIXJrJyRPHiZK', '0716821170', NULL, '2025-05-19 12:39:35'),
(12, 'supervisor4', 'supervisor4@gmail.com', '$2b$10$X4JgpKGiwCUAWDMpLDXOmOP7Xi.dZJT2xvNz4J1HFLulUUMv35k5e', '0716821170', NULL, '2025-05-19 12:52:34');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `cashiers`
--
ALTER TABLE `cashiers`
  ADD PRIMARY KEY (`CashierID`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`CustomerID`),
  ADD KEY `email` (`email`);

--
-- Indexes for table `custom_orders`
--
ALTER TABLE `custom_orders`
  ADD PRIMARY KEY (`order_id`);

--
-- Indexes for table `custom_order_designs`
--
ALTER TABLE `custom_order_designs`
  ADD PRIMARY KEY (`design_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`invoice_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_invoice_order` (`quotation_id`);

--
-- Indexes for table `invoice_item`
--
ALTER TABLE `invoice_item`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_invoice_items` (`invoice_id`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`item_id`);

--
-- Indexes for table `material_images`
--
ALTER TABLE `material_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `material_id` (`material_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `supervisors`
--
ALTER TABLE `supervisors`
  ADD PRIMARY KEY (`SupervisorID`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cashiers`
--
ALTER TABLE `cashiers`
  MODIFY `CashierID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `CustomerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `custom_orders`
--
ALTER TABLE `custom_orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `custom_order_designs`
--
ALTER TABLE `custom_order_designs`
  MODIFY `design_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `invoice`
--
ALTER TABLE `invoice`
  MODIFY `invoice_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `invoice_item`
--
ALTER TABLE `invoice_item`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `material_images`
--
ALTER TABLE `material_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `supervisors`
--
ALTER TABLE `supervisors`
  MODIFY `SupervisorID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `custom_order_designs`
--
ALTER TABLE `custom_order_designs`
  ADD CONSTRAINT `custom_order_designs_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `custom_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_invoice_order` FOREIGN KEY (`quotation_id`) REFERENCES `custom_orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoice_item`
--
ALTER TABLE `invoice_item`
  ADD CONSTRAINT `invoice_item_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`invoice_id`) ON DELETE CASCADE;

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `fk_invoice_items` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `material_images`
--
ALTER TABLE `material_images`
  ADD CONSTRAINT `material_images_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `materials` (`item_id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`CustomerID`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
