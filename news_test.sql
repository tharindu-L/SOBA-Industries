-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 12, 2025 at 06:24 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

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
-- Table structure for table `cashiers`
--

use news_test;

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
(1, 'Nadeeka Nimshan', 's@gmail.com', '$2b$10$YAa6bcSl14R5ehpyAJdra.F.kSZb2D9YypsJZpIAT08uE3ia2Shw6', '0714032013', NULL, 0, '2025-05-11 17:15:11');

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
(3, 'Nadeeka Nimshan', 's@gmail.com', '$2b$10$TEtMcykgdbwvRInge8FyB.2./u.S9dWMy4uI8P7FgW3utvbFCN0Di', '0714032013', '1746966168970-Screenshot_2025-04-29_141556-removebg-preview.png', '2025-03-31 06:38:09');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_orders`
--

INSERT INTO `custom_orders` (`order_id`, `customer_id`, `description`, `quantity`, `status`, `special_notes`, `created_at`, `updated_at`) VALUES
(2, '3', 'wdw', 1, 'in_progress', 'dwd', '2025-05-11 05:36:06', '2025-05-11 10:59:37'),
(3, '3', 'sasa', 10, 'completed', 'adas', '2025-05-11 05:52:36', '2025-05-11 09:22:59'),
(4, '3', 'dwd', 1, 'completed', 'dwd', '2025-05-11 05:55:11', '2025-05-11 09:23:02');

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
(2, 2, '1746941766201-designFiles.png', 'image/png', 'uploads\\1746941766201-designFiles.png'),
(3, 3, '1746942756054-designFiles.png', 'image/png', 'uploads\\1746942756054-designFiles.png'),
(4, 4, '1746942911867-designFiles.jpg', 'image/jpeg', 'uploads\\1746942911867-designFiles.jpg');

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

--
-- Dumping data for table `invoice`
--

INSERT INTO `invoice` (`invoice_id`, `quotation_id`, `total_amount`, `paid_amount`, `payment_status`, `created_at`) VALUES
(1, 1747023295065, 212.00, 0.00, 'Pending', '2025-05-12 09:44:55'),
(2, 1747023385721, 212.00, 0.00, 'Pending', '2025-05-12 09:46:25');

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
  `payment_status` enum('Pending','Partially Paid','Completed') DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `quotation_id`, `total_amount`, `created_at`, `paid_amount`, `payment_status`) VALUES
(10, 2, 296.00, '2025-05-11 11:23:49', 296.00, 'Completed');

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

--
-- Dumping data for table `invoice_item`
--

INSERT INTO `invoice_item` (`item_id`, `invoice_id`, `material_name`, `quantity`, `unit_price`, `created_at`) VALUES
(1, 2, 'shashika', 1, 12.00, '2025-05-12 09:46:25');

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
(10, 10, 'shashika', 8, 12.00);

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `item_id` varchar(50) NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `available_qty` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`item_id`, `item_name`, `available_qty`, `unit_price`) VALUES
('M0102', 'shashika', 0, 12.00);

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
(2, 'M0102', 'uploads\\1746776314134-images.png', 'image/png', '1746776314134-images.png');

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
(2, 3, '2025-05-10 19:01:25', 24.00, 'paid', 'advance', 7.20, NULL, NULL, 'shipped'),
(3, 3, '2025-05-11 09:47:42', 12.00, 'paid', 'advance', 12.00, NULL, NULL, 'shipped');

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
(2, 2, 'w12', 2, 12.00),
(3, 3, 'A001', 1, 12.00);

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
('A001', 'shashika', 'Lunch', 12.00, 11, 'dd', '2025-05-09 09:27:45'),
('w12', 'shashika', 'Teddy Bears & Soft Toys', 12.00, 10, 'sss', '2025-05-09 09:11:36');

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
(3, 'w12', '1746781896821-productImage.png', 'image/png', 'uploads\\1746781896821-productImage.png', '2025-05-09 09:11:36'),
(4, 'A001', '1746782865578-productImage.jpg', 'image/jpeg', 'uploads\\1746782865578-productImage.jpg', '2025-05-09 09:27:45');

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
  `nickname` varchar(100) NOT NULL,
  `nic` varchar(12) NOT NULL,
  `join_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supervisors`
--

INSERT INTO `supervisors` (`SupervisorID`, `supervisor_name`, `email`, `password`, `tel_num`, `profile_image`, `nickname`, `nic`, `join_date`) VALUES
(2, 'Nadeeka Nimshan', 's@gmail.com', '$2b$10$4OjENHvVVUiYZTn7aDSX9OQvg1EA3/vizFEjIdRIZv3mm4Txptjlm', '0714032013', NULL, 'nadeeka_nimshan2634', '199923601557', '2025-03-31 06:37:41');

--
-- Indexes for dumped tables
--

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
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `nickname` (`nickname`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cashiers`
--
ALTER TABLE `cashiers`
  MODIFY `CashierID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `CustomerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `custom_orders`
--
ALTER TABLE `custom_orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `custom_order_designs`
--
ALTER TABLE `custom_order_designs`
  MODIFY `design_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `invoice`
--
ALTER TABLE `invoice`
  MODIFY `invoice_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `invoice_item`
--
ALTER TABLE `invoice_item`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `material_images`
--
ALTER TABLE `material_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `supervisors`
--
ALTER TABLE `supervisors`
  MODIFY `SupervisorID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
